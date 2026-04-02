package com.textcoach.keyboard

import android.app.AlertDialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.text.TextUtils
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.HorizontalScrollView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * TextCoach Custom Keyboard (Android Input Method Service)
 *
 * Provides Quick Suggest functionality directly from the keyboard.
 *
 * Flow:
 * 1. User taps TC toggle button on keyboard toolbar
 * 2. Compact UI shows: paste field + "Read" + "Suggest" buttons
 * 3. Suggestions appear as tappable pills in a horizontal scroll view
 * 4. Tap a pill to insert its text into the active text field
 * 5. Long-press a pill to see full text + reasoning in a dialog
 *
 * Auth: Shares credentials with main app via SharedPreferences
 */
class TextCoachIME : InputMethodService() {

    companion object {
        private const val API_URL = "https://prompt-improver-1.onrender.com"
        private const val COLOR_PRIMARY = "#7616D0"
        private const val COLOR_PRIMARY_LIGHT = "#EDE3FA"
        private const val COLOR_SUCCESS = "#22C55E"
        private const val COLOR_ERROR = "#EF4444"
        private const val COLOR_TEXT_DARK = "#1E293B"
        private const val COLOR_TEXT_MUTED = "#94A3B8"
        private const val MAX_PILL_CHARS = 40
    }

    private val serviceJob = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.Main + serviceJob)

    // Views
    private lateinit var rootView: View
    private lateinit var inputContainer: LinearLayout
    private lateinit var errorContainer: LinearLayout
    private lateinit var suggestionScroll: HorizontalScrollView
    private lateinit var suggestionBar: LinearLayout
    private lateinit var pasteField: EditText
    private lateinit var suggestBtn: Button
    private lateinit var readContextBtn: Button
    private lateinit var retryBtn: Button
    private lateinit var errorText: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var toggleBtn: Button

    private var isInputVisible = false
    private var lastConversation = ""

    // Data class for richer suggestion info
    data class Suggestion(
        val text: String,
        val toneLabel: String,
        val reasoning: String,
        val isRecommended: Boolean
    )

    // ── Lifecycle ──────────────────────────────────────────────

    override fun onCreateInputView(): View {
        rootView = LayoutInflater.from(this).inflate(
            R.layout.keyboard_layout, null
        )
        bindViews()
        wireListeners()
        return rootView
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        // Reset state for new input session
        hideError()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }

    // ── View Binding ───────────────────────────────────────────

    private fun bindViews() {
        inputContainer = rootView.findViewById(R.id.inputContainer)
        errorContainer = rootView.findViewById(R.id.errorContainer)
        suggestionScroll = rootView.findViewById(R.id.suggestionScroll)
        suggestionBar = rootView.findViewById(R.id.suggestionBar)
        pasteField = rootView.findViewById(R.id.pasteField)
        suggestBtn = rootView.findViewById(R.id.suggestBtn)
        readContextBtn = rootView.findViewById(R.id.readContextBtn)
        retryBtn = rootView.findViewById(R.id.retryBtn)
        errorText = rootView.findViewById(R.id.errorText)
        progressBar = rootView.findViewById(R.id.progressBar)
        toggleBtn = rootView.findViewById(R.id.toggleBtn)

        // Apply purple theming
        applyTheming()
    }

    private fun applyTheming() {
        // Toggle button: purple background, white text
        toggleBtn.setBackgroundColor(Color.parseColor(COLOR_PRIMARY))
        toggleBtn.setTextColor(Color.WHITE)

        // Suggest button: purple background
        suggestBtn.setBackgroundColor(Color.parseColor(COLOR_PRIMARY))
        suggestBtn.setTextColor(Color.WHITE)

        // Read button: light purple background
        readContextBtn.setBackgroundColor(Color.parseColor(COLOR_PRIMARY_LIGHT))
        readContextBtn.setTextColor(Color.parseColor(COLOR_PRIMARY))

        // Retry button styling
        retryBtn.setBackgroundColor(Color.parseColor(COLOR_ERROR))
        retryBtn.setTextColor(Color.WHITE)
    }

    private fun wireListeners() {
        toggleBtn.setOnClickListener { toggleInput() }
        suggestBtn.setOnClickListener { handleSuggest() }
        readContextBtn.setOnClickListener { readContext() }
        retryBtn.setOnClickListener { handleRetry() }
    }

    // ── Toggle ─────────────────────────────────────────────────

    private fun toggleInput() {
        isInputVisible = !isInputVisible
        inputContainer.visibility = if (isInputVisible) View.VISIBLE else View.GONE
        if (!isInputVisible) {
            hideError()
            suggestionScroll.visibility = View.GONE
        }
        toggleBtn.contentDescription = if (isInputVisible)
            "Hide TextCoach input" else "Show TextCoach input"
    }

    // ── Read Context ───────────────────────────────────────────

    private fun readContext() {
        val ic = currentInputConnection ?: run {
            showError("No active text field found")
            return
        }

        // Read text before cursor (up to 2000 chars for context)
        val beforeCursor = ic.getTextBeforeCursor(2000, 0)
        val afterCursor = ic.getTextAfterCursor(500, 0)

        val contextText = buildString {
            if (!TextUtils.isEmpty(beforeCursor)) append(beforeCursor)
            if (!TextUtils.isEmpty(afterCursor)) append(afterCursor)
        }

        if (contextText.isBlank()) {
            showError("No text found in current field")
            return
        }

        pasteField.setText(contextText)
        pasteField.contentDescription = "Conversation text: ${contextText.take(50)}..."
    }

    // ── Suggest ────────────────────────────────────────────────

    private fun handleSuggest() {
        val text = pasteField.text.toString().trim()
        if (text.isBlank()) {
            showError("Please paste or read some conversation text first")
            return
        }

        lastConversation = text
        hideError()
        setLoading(true)

        scope.launch {
            try {
                val suggestions = withContext(Dispatchers.IO) {
                    fetchSuggestions(text)
                }
                setLoading(false)
                if (suggestions.isEmpty()) {
                    showError("No suggestions returned. Try a longer conversation.")
                } else {
                    showSuggestions(suggestions)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                setLoading(false)
                showError(friendlyError(e))
            }
        }
    }

    private fun handleRetry() {
        hideError()
        if (lastConversation.isNotBlank()) {
            pasteField.setText(lastConversation)
        }
        handleSuggest()
    }

    // ── API Call ────────────────────────────────────────────────

    private fun fetchSuggestions(conversation: String): List<Suggestion> {
        val userId = getUserId()
            ?: throw IllegalStateException("Not signed in. Open TextCoach app to sign in.")

        val url = URL("$API_URL/quick-suggest")
        val conn = url.openConnection() as HttpURLConnection
        try {
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.setRequestProperty("X-TextCoach-Source", "keyboard")
            conn.connectTimeout = 15_000
            conn.readTimeout = 30_000
            conn.doOutput = true

            val body = JSONObject().apply {
                put("conversation", conversation)
                put("userId", userId)
            }

            OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use {
                it.write(body.toString())
            }

            val responseCode = conn.responseCode
            if (responseCode !in 200..299) {
                val errorBody = try {
                    conn.errorStream?.bufferedReader()?.readText() ?: ""
                } catch (_: Exception) { "" }
                throw RuntimeException("Server error ($responseCode): $errorBody")
            }

            val response = BufferedReader(InputStreamReader(conn.inputStream, Charsets.UTF_8))
                .readText()
            val json = JSONObject(response)
            val suggestionsArray = json.getJSONArray("suggestions")

            // Determine which index is recommended (first one by default)
            val recommendedIndex = json.optInt("recommendedIndex", 0)

            val results = mutableListOf<Suggestion>()
            for (i in 0 until minOf(suggestionsArray.length(), 5)) {
                val s = suggestionsArray.getJSONObject(i)
                results.add(
                    Suggestion(
                        text = s.getString("text"),
                        toneLabel = s.optString("toneLabel", "Option ${i + 1}"),
                        reasoning = s.optString("reasoning", ""),
                        isRecommended = (i == recommendedIndex)
                    )
                )
            }
            return results
        } finally {
            conn.disconnect()
        }
    }

    // ── Suggestion Pills ───────────────────────────────────────

    private fun showSuggestions(suggestions: List<Suggestion>) {
        suggestionBar.removeAllViews()

        for (suggestion in suggestions) {
            val pill = createPill(suggestion)
            suggestionBar.addView(pill)
        }

        suggestionScroll.visibility = View.VISIBLE
        suggestionScroll.contentDescription =
            "${suggestions.size} suggestions available. Scroll horizontally to see all."
    }

    private fun createPill(suggestion: Suggestion): TextView {
        val truncatedText = if (suggestion.text.length > MAX_PILL_CHARS) {
            suggestion.text.take(MAX_PILL_CHARS) + "..."
        } else {
            suggestion.text
        }

        val pillLabel = "${suggestion.toneLabel}: $truncatedText"

        return TextView(this).apply {
            text = pillLabel
            textSize = 12f
            setTextColor(Color.parseColor(COLOR_TEXT_DARK))
            maxLines = 2
            ellipsize = TextUtils.TruncateAt.END
            setPadding(24, 12, 24, 12)
            gravity = Gravity.CENTER_VERTICAL

            // Pill shape background
            val bg = GradientDrawable().apply {
                cornerRadius = 20f
                if (suggestion.isRecommended) {
                    setColor(Color.parseColor(COLOR_PRIMARY_LIGHT))
                    setStroke(3, Color.parseColor(COLOR_SUCCESS))
                } else {
                    setColor(Color.parseColor(COLOR_PRIMARY_LIGHT))
                    setStroke(1, Color.parseColor("#CBA9EE"))
                }
            }
            background = bg

            // Layout params with margin
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = 8
                topMargin = 4
                bottomMargin = 4
            }

            // Accessibility
            contentDescription = buildString {
                if (suggestion.isRecommended) append("Recommended. ")
                append("${suggestion.toneLabel}: ${suggestion.text.take(80)}")
            }

            // Tap: insert text
            setOnClickListener {
                currentInputConnection?.commitText(suggestion.text, 1)
                suggestionScroll.visibility = View.GONE
                pasteField.text.clear()
            }

            // Long-press: show full text + reasoning dialog
            setOnLongClickListener {
                showDetailDialog(suggestion)
                true
            }
        }
    }

    // ── Detail Dialog ──────────────────────────────────────────

    private fun showDetailDialog(suggestion: Suggestion) {
        val dialogView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 32, 48, 32)
        }

        // Tone label header
        dialogView.addView(TextView(this).apply {
            text = suggestion.toneLabel + if (suggestion.isRecommended) " (Recommended)" else ""
            textSize = 16f
            setTextColor(Color.parseColor(COLOR_PRIMARY))
            setPadding(0, 0, 0, 16)
        })

        // Full message text
        dialogView.addView(TextView(this).apply {
            text = suggestion.text
            textSize = 14f
            setTextColor(Color.parseColor(COLOR_TEXT_DARK))
            setPadding(0, 0, 0, 16)
        })

        // Reasoning (if available)
        if (suggestion.reasoning.isNotBlank()) {
            dialogView.addView(TextView(this).apply {
                text = "Why this works:"
                textSize = 12f
                setTextColor(Color.parseColor(COLOR_TEXT_MUTED))
                setPadding(0, 0, 0, 4)
            })
            dialogView.addView(TextView(this).apply {
                text = suggestion.reasoning
                textSize = 13f
                setTextColor(Color.parseColor(COLOR_TEXT_DARK))
            })
        }

        val dialog = AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Light_Dialog)
            .setView(dialogView)
            .setPositiveButton("Use This") { _, _ ->
                currentInputConnection?.commitText(suggestion.text, 1)
                suggestionScroll.visibility = View.GONE
                pasteField.text.clear()
            }
            .setNegativeButton("Close", null)
            .create()

        // Required for showing dialog from IME service
        dialog.window?.setType(WindowManager.LayoutParams.TYPE_APPLICATION_ATTACHED_DIALOG)
        dialog.show()
    }

    // ── Error Handling UI ──────────────────────────────────────

    private fun showError(message: String) {
        errorText.text = message
        errorContainer.visibility = View.VISIBLE
        errorContainer.contentDescription = "Error: $message"
    }

    private fun hideError() {
        errorContainer.visibility = View.GONE
    }

    private fun friendlyError(e: Exception): String {
        return when {
            e is IllegalStateException -> e.message ?: "Authentication error"
            e.message?.contains("Unable to resolve host") == true ->
                "No internet connection. Check your network."
            e.message?.contains("timeout", ignoreCase = true) == true ->
                "Request timed out. Try again."
            e.message?.contains("Server error (4") == true ->
                "Request error. Check your input."
            e.message?.contains("Server error (5") == true ->
                "Server is temporarily unavailable. Try again shortly."
            else -> "Something went wrong: ${e.message?.take(80) ?: "Unknown error"}"
        }
    }

    // ── Loading State ──────────────────────────────────────────

    private fun setLoading(loading: Boolean) {
        suggestBtn.visibility = if (loading) View.GONE else View.VISIBLE
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        readContextBtn.isEnabled = !loading
        pasteField.isEnabled = !loading
    }

    // ── Auth ───────────────────────────────────────────────────

    private fun getUserId(): String? {
        val prefs = getSharedPreferences("textcoach_shared", Context.MODE_PRIVATE)
        return prefs.getString("userId", null)
    }
}
