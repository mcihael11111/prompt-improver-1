package com.textcoach.keyboard

import android.content.ClipboardManager
import android.content.Context
import android.inputmethodservice.InputMethodService
import android.view.LayoutInflater
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
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
 * 1. User taps TextCoach icon on keyboard toolbar
 * 2. Compact UI shows: paste field + "Suggest" button
 * 3. Suggestions appear as tappable pills above the keyboard
 * 4. Tap to insert into active text field
 *
 * Auth: Shares credentials with main app via SharedPreferences
 */
class TextCoachIME : InputMethodService() {

    private val apiURL = "https://textcoach-api.onrender.com"
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private lateinit var inputContainer: LinearLayout
    private lateinit var suggestionBar: LinearLayout
    private lateinit var pasteField: EditText
    private lateinit var suggestButton: Button
    private lateinit var progressBar: ProgressBar

    private var isInputVisible = false

    override fun onCreateInputView(): View {
        val view = LayoutInflater.from(this).inflate(
            resources.getIdentifier("keyboard_layout", "layout", packageName),
            null
        ) ?: createFallbackView()

        setupViews(view)
        return view
    }

    private fun createFallbackView(): View {
        // Programmatic fallback if XML layout is missing
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(16, 8, 16, 8)
        }

        // Input container
        inputContainer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            visibility = View.GONE
        }

        pasteField = EditText(this).apply {
            hint = "Paste conversation..."
            textSize = 14f
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        inputContainer.addView(pasteField)

        suggestButton = Button(this).apply {
            text = "Suggest"
            textSize = 12f
            setOnClickListener { handleSuggest() }
        }
        inputContainer.addView(suggestButton)

        progressBar = ProgressBar(this).apply {
            visibility = View.GONE
        }
        inputContainer.addView(progressBar)

        root.addView(inputContainer)

        // Suggestion bar
        suggestionBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            visibility = View.GONE
        }
        root.addView(suggestionBar)

        // Toggle button row
        val toggleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
        }
        val toggleBtn = Button(this).apply {
            text = "TC"
            textSize = 10f
            setOnClickListener { toggleInput() }
        }
        toggleRow.addView(toggleBtn)
        root.addView(toggleRow)

        return root
    }

    private fun setupViews(view: View) {
        // Try to find views from XML layout, fallback to programmatic
        inputContainer = view.findViewByIdOrNull("input_container") ?: inputContainer
        suggestionBar = view.findViewByIdOrNull("suggestion_bar") ?: suggestionBar
        pasteField = view.findViewByIdOrNull("paste_field") ?: pasteField
        suggestButton = view.findViewByIdOrNull("suggest_button") ?: suggestButton
        progressBar = view.findViewByIdOrNull("progress_bar") ?: progressBar
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T : View> View.findViewByIdOrNull(name: String): T? {
        val id = resources.getIdentifier(name, "id", packageName)
        return if (id != 0) findViewById(id) else null
    }

    private fun toggleInput() {
        isInputVisible = !isInputVisible
        inputContainer.visibility = if (isInputVisible) View.VISIBLE else View.GONE
    }

    private fun handleSuggest() {
        val text = pasteField.text.toString()
        if (text.isBlank()) return

        suggestButton.visibility = View.GONE
        progressBar.visibility = View.VISIBLE

        scope.launch {
            val suggestions = fetchSuggestions(text)
            withContext(Dispatchers.Main) {
                suggestButton.visibility = View.VISIBLE
                progressBar.visibility = View.GONE
                showSuggestions(suggestions)
            }
        }
    }

    private fun fetchSuggestions(conversation: String): List<Pair<String, String>> {
        val userId = getUserId() ?: return emptyList()

        return try {
            val url = URL("$apiURL/quick-suggest")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.setRequestProperty("X-TextCoach-Source", "keyboard")
            conn.doOutput = true

            val body = JSONObject().apply {
                put("conversation", conversation)
                put("userId", userId)
            }

            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

            val response = BufferedReader(InputStreamReader(conn.inputStream)).readText()
            val json = JSONObject(response)
            val suggestionsArray = json.getJSONArray("suggestions")

            val results = mutableListOf<Pair<String, String>>()
            for (i in 0 until minOf(suggestionsArray.length(), 3)) {
                val s = suggestionsArray.getJSONObject(i)
                results.add(Pair(s.getString("text"), s.getString("toneLabel")))
            }
            results
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    private fun showSuggestions(suggestions: List<Pair<String, String>>) {
        suggestionBar.removeAllViews()

        for ((text, label) in suggestions) {
            val pill = Button(this).apply {
                this.text = label
                textSize = 11f
                setPadding(24, 8, 24, 8)
                setOnClickListener {
                    currentInputConnection?.commitText(text, 1)
                    suggestionBar.visibility = View.GONE
                    pasteField.text.clear()
                }
                layoutParams = LinearLayout.LayoutParams(
                    0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f
                ).apply { marginEnd = 8 }
            }
            suggestionBar.addView(pill)
        }

        suggestionBar.visibility = if (suggestions.isNotEmpty()) View.VISIBLE else View.GONE
    }

    private fun getUserId(): String? {
        // Read from shared preferences (written by main app on sign-in)
        val prefs = getSharedPreferences("textcoach_shared", Context.MODE_PRIVATE)
        return prefs.getString("userId", null)
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
