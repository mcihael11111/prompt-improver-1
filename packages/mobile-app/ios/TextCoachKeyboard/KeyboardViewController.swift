import UIKit

/// TextCoach Custom Keyboard Extension
///
/// Native Swift keyboard extension (NOT React Native) due to iOS memory limits (~30MB).
/// Provides Quick Suggest functionality directly from the keyboard.
///
/// Flow:
/// 1. User taps TC toggle on keyboard toolbar
/// 2. Compact UI appears: paste field + "Read Context" + "Suggest" button
/// 3. Suggestions appear as tappable pills above the keyboard
/// 4. Tap a pill to insert its text; long-press to see full text + reasoning
///
/// Auth: Shares credentials with main app via App Groups / shared Keychain
/// API: Calls the TextCoach backend directly via URLSession

class KeyboardViewController: UIInputViewController {

    // MARK: - Properties

    private var suggestionScrollView: UIScrollView!
    private var suggestionStack: UIStackView!
    private var inputContainer: UIView!
    private var pasteField: UITextField!
    private var suggestButton: UIButton!
    private var readContextButton: UIButton!
    private var loadingIndicator: UIActivityIndicatorView!
    private var errorBanner: UIView!
    private var errorLabel: UILabel!
    private var retryButton: UIButton!
    private var isShowingInput = false
    private var detailOverlay: UIView?

    /// Stored suggestions so long-press can access reasoning
    private var currentSuggestions: [[String: Any]] = []

    private let apiURL = "https://prompt-improver-1.onrender.com"
    private let primaryColor = UIColor(red: 118/255, green: 22/255, blue: 208/255, alpha: 1)
    private let pillBgColor = UIColor(red: 237/255, green: 227/255, blue: 250/255, alpha: 1)
    private let bestBorderColor = UIColor(red: 34/255, green: 197/255, blue: 94/255, alpha: 1) // green-500

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Ensure height is set properly for the keyboard
        if let iv = inputView {
            iv.allowsSelfSizing = true
        }
    }

    // MARK: - UI Setup

    private func setupUI() {
        guard let inputView = self.inputView else { return }
        inputView.translatesAutoresizingMaskIntoConstraints = false
        inputView.backgroundColor = .systemBackground

        // Use rounded design font similar to Poppins
        let baseFontDesc = UIFont.systemFont(ofSize: 14, weight: .medium).fontDescriptor
            .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 14, weight: .medium).fontDescriptor
        let baseFont = UIFont(descriptor: baseFontDesc, size: 14)
        let smallFont = UIFont(descriptor: baseFontDesc, size: 12)
        let boldSmallFont = UIFont(
            descriptor: (UIFont.systemFont(ofSize: 12, weight: .bold).fontDescriptor
                .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 12, weight: .bold).fontDescriptor),
            size: 12
        )

        // ── Error Banner (hidden by default) ──────────────────────────────
        errorBanner = UIView()
        errorBanner.backgroundColor = UIColor.systemRed.withAlphaComponent(0.12)
        errorBanner.layer.cornerRadius = 8
        errorBanner.translatesAutoresizingMaskIntoConstraints = false
        errorBanner.isHidden = true
        inputView.addSubview(errorBanner)

        errorLabel = UILabel()
        errorLabel.font = smallFont
        errorLabel.textColor = .systemRed
        errorLabel.numberOfLines = 2
        errorLabel.text = "Something went wrong."
        errorLabel.translatesAutoresizingMaskIntoConstraints = false
        errorLabel.accessibilityIdentifier = "tc_error_label"
        errorBanner.addSubview(errorLabel)

        retryButton = UIButton(type: .system)
        retryButton.setTitle("Retry", for: .normal)
        retryButton.titleLabel?.font = boldSmallFont
        retryButton.setTitleColor(.systemRed, for: .normal)
        retryButton.translatesAutoresizingMaskIntoConstraints = false
        retryButton.addTarget(self, action: #selector(handleRetry), for: .touchUpInside)
        retryButton.accessibilityLabel = "Retry suggestion request"
        retryButton.accessibilityTraits = .button
        errorBanner.addSubview(retryButton)

        // ── Suggestion ScrollView ─────────────────────────────────────────
        suggestionScrollView = UIScrollView()
        suggestionScrollView.showsHorizontalScrollIndicator = false
        suggestionScrollView.translatesAutoresizingMaskIntoConstraints = false
        suggestionScrollView.isHidden = true
        inputView.addSubview(suggestionScrollView)

        suggestionStack = UIStackView()
        suggestionStack.axis = .horizontal
        suggestionStack.spacing = 8
        suggestionStack.alignment = .center
        suggestionStack.translatesAutoresizingMaskIntoConstraints = false
        suggestionScrollView.addSubview(suggestionStack)

        // ── Input Container ───────────────────────────────────────────────
        inputContainer = UIView()
        inputContainer.translatesAutoresizingMaskIntoConstraints = false
        inputContainer.backgroundColor = .clear
        inputContainer.isHidden = true
        inputView.addSubview(inputContainer)

        // Paste field
        pasteField = UITextField()
        pasteField.placeholder = "Paste conversation..."
        pasteField.borderStyle = .roundedRect
        pasteField.font = baseFont
        pasteField.backgroundColor = UIColor.secondarySystemBackground
        pasteField.translatesAutoresizingMaskIntoConstraints = false
        pasteField.accessibilityLabel = "Conversation input field"
        pasteField.accessibilityHint = "Paste or type a conversation to get suggestions"
        inputContainer.addSubview(pasteField)

        // Read Context button
        readContextButton = UIButton(type: .system)
        readContextButton.setTitle("Read", for: .normal)
        readContextButton.titleLabel?.font = smallFont
        readContextButton.setTitleColor(primaryColor, for: .normal)
        readContextButton.backgroundColor = pillBgColor
        readContextButton.layer.cornerRadius = 14
        readContextButton.contentEdgeInsets = UIEdgeInsets(top: 4, left: 10, bottom: 4, right: 10)
        readContextButton.translatesAutoresizingMaskIntoConstraints = false
        readContextButton.addTarget(self, action: #selector(handleReadContext), for: .touchUpInside)
        readContextButton.accessibilityLabel = "Read text from current field"
        readContextButton.accessibilityHint = "Reads text before the cursor in the active text field"
        readContextButton.accessibilityTraits = .button
        inputContainer.addSubview(readContextButton)

        // Suggest button
        suggestButton = UIButton(type: .system)
        suggestButton.setTitle("Suggest", for: .normal)
        suggestButton.backgroundColor = primaryColor
        suggestButton.setTitleColor(.white, for: .normal)
        suggestButton.titleLabel?.font = UIFont(
            descriptor: (UIFont.systemFont(ofSize: 14, weight: .semibold).fontDescriptor
                .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 14, weight: .semibold).fontDescriptor),
            size: 14
        )
        suggestButton.layer.cornerRadius = 16
        suggestButton.contentEdgeInsets = UIEdgeInsets(top: 4, left: 14, bottom: 4, right: 14)
        suggestButton.translatesAutoresizingMaskIntoConstraints = false
        suggestButton.addTarget(self, action: #selector(handleSuggest), for: .touchUpInside)
        suggestButton.accessibilityLabel = "Get suggestions"
        suggestButton.accessibilityHint = "Sends the conversation text to get reply suggestions"
        suggestButton.accessibilityTraits = .button
        inputContainer.addSubview(suggestButton)

        // Loading indicator
        loadingIndicator = UIActivityIndicatorView(style: .medium)
        loadingIndicator.color = .white
        loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
        loadingIndicator.hidesWhenStopped = true
        inputContainer.addSubview(loadingIndicator)

        // ── Bottom toolbar: TC toggle + globe ─────────────────────────────
        let bottomBar = UIView()
        bottomBar.translatesAutoresizingMaskIntoConstraints = false
        inputView.addSubview(bottomBar)

        let toggleButton = UIButton(type: .system)
        toggleButton.setTitle("TC", for: .normal)
        toggleButton.backgroundColor = primaryColor
        toggleButton.setTitleColor(.white, for: .normal)
        toggleButton.titleLabel?.font = boldSmallFont
        toggleButton.layer.cornerRadius = 14
        toggleButton.translatesAutoresizingMaskIntoConstraints = false
        toggleButton.addTarget(self, action: #selector(toggleInput), for: .touchUpInside)
        toggleButton.accessibilityLabel = "Toggle TextCoach panel"
        toggleButton.accessibilityHint = "Shows or hides the suggestion input area"
        toggleButton.accessibilityTraits = .button
        bottomBar.addSubview(toggleButton)

        let nextKeyboardButton = UIButton(type: .system)
        let globeImage = UIImage(systemName: "globe")
        nextKeyboardButton.setImage(globeImage, for: .normal)
        nextKeyboardButton.tintColor = .secondaryLabel
        nextKeyboardButton.translatesAutoresizingMaskIntoConstraints = false
        nextKeyboardButton.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
        nextKeyboardButton.accessibilityLabel = "Switch keyboard"
        nextKeyboardButton.accessibilityHint = "Switches to the next keyboard"
        nextKeyboardButton.accessibilityTraits = .button
        bottomBar.addSubview(nextKeyboardButton)

        // ── Constraints ───────────────────────────────────────────────────
        NSLayoutConstraint.activate([
            // Error banner
            errorBanner.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            errorBanner.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            errorBanner.topAnchor.constraint(equalTo: inputView.topAnchor, constant: 4),
            errorBanner.heightAnchor.constraint(equalToConstant: 36),

            errorLabel.leadingAnchor.constraint(equalTo: errorBanner.leadingAnchor, constant: 10),
            errorLabel.centerYAnchor.constraint(equalTo: errorBanner.centerYAnchor),
            errorLabel.trailingAnchor.constraint(equalTo: retryButton.leadingAnchor, constant: -6),

            retryButton.trailingAnchor.constraint(equalTo: errorBanner.trailingAnchor, constant: -10),
            retryButton.centerYAnchor.constraint(equalTo: errorBanner.centerYAnchor),

            // Input container
            inputContainer.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            inputContainer.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            inputContainer.topAnchor.constraint(equalTo: inputView.topAnchor, constant: 4),
            inputContainer.heightAnchor.constraint(equalToConstant: 44),

            // Paste field
            pasteField.leadingAnchor.constraint(equalTo: inputContainer.leadingAnchor),
            pasteField.centerYAnchor.constraint(equalTo: inputContainer.centerYAnchor),
            pasteField.trailingAnchor.constraint(equalTo: readContextButton.leadingAnchor, constant: -6),
            pasteField.heightAnchor.constraint(equalToConstant: 36),

            // Read context
            readContextButton.centerYAnchor.constraint(equalTo: inputContainer.centerYAnchor),
            readContextButton.trailingAnchor.constraint(equalTo: suggestButton.leadingAnchor, constant: -6),
            readContextButton.heightAnchor.constraint(equalToConstant: 32),

            // Suggest button
            suggestButton.trailingAnchor.constraint(equalTo: inputContainer.trailingAnchor),
            suggestButton.centerYAnchor.constraint(equalTo: inputContainer.centerYAnchor),
            suggestButton.heightAnchor.constraint(equalToConstant: 32),

            // Loading
            loadingIndicator.centerXAnchor.constraint(equalTo: suggestButton.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: suggestButton.centerYAnchor),

            // Suggestion scroll
            suggestionScrollView.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            suggestionScrollView.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            suggestionScrollView.topAnchor.constraint(equalTo: inputContainer.bottomAnchor, constant: 6),
            suggestionScrollView.heightAnchor.constraint(equalToConstant: 40),

            suggestionStack.leadingAnchor.constraint(equalTo: suggestionScrollView.leadingAnchor),
            suggestionStack.trailingAnchor.constraint(equalTo: suggestionScrollView.trailingAnchor),
            suggestionStack.topAnchor.constraint(equalTo: suggestionScrollView.topAnchor),
            suggestionStack.bottomAnchor.constraint(equalTo: suggestionScrollView.bottomAnchor),
            suggestionStack.heightAnchor.constraint(equalTo: suggestionScrollView.heightAnchor),

            // Bottom bar
            bottomBar.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            bottomBar.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            bottomBar.bottomAnchor.constraint(equalTo: inputView.bottomAnchor, constant: -6),
            bottomBar.heightAnchor.constraint(equalToConstant: 30),

            toggleButton.leadingAnchor.constraint(equalTo: bottomBar.leadingAnchor),
            toggleButton.centerYAnchor.constraint(equalTo: bottomBar.centerYAnchor),
            toggleButton.widthAnchor.constraint(equalToConstant: 28),
            toggleButton.heightAnchor.constraint(equalToConstant: 28),

            nextKeyboardButton.trailingAnchor.constraint(equalTo: bottomBar.trailingAnchor),
            nextKeyboardButton.centerYAnchor.constraint(equalTo: bottomBar.centerYAnchor),
            nextKeyboardButton.widthAnchor.constraint(equalToConstant: 28),
            nextKeyboardButton.heightAnchor.constraint(equalToConstant: 28),
        ])
    }

    // MARK: - Actions

    @objc private func toggleInput() {
        isShowingInput.toggle()
        inputContainer.isHidden = !isShowingInput
        errorBanner.isHidden = true

        if !isShowingInput {
            suggestionScrollView.isHidden = true
            dismissDetailOverlay()
        }
    }

    @objc private func handleReadContext() {
        // Read text from the active text field via textDocumentProxy
        let contextBefore = textDocumentProxy.documentContextBeforeInput ?? ""
        if contextBefore.isEmpty {
            showError("No text found before the cursor.")
            return
        }

        // Prepend context to existing paste field text
        let existing = pasteField.text ?? ""
        if existing.isEmpty {
            pasteField.text = contextBefore
        } else {
            pasteField.text = contextBefore + "\n" + existing
        }

        // Brief visual feedback
        let original = readContextButton.backgroundColor
        readContextButton.backgroundColor = bestBorderColor.withAlphaComponent(0.3)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
            self?.readContextButton.backgroundColor = original
        }
    }

    @objc private func handleSuggest() {
        guard let text = pasteField.text, !text.isEmpty else {
            showError("Paste or read some conversation text first.")
            return
        }

        errorBanner.isHidden = true
        dismissDetailOverlay()
        suggestButton.setTitle("", for: .normal)
        suggestButton.isEnabled = false
        loadingIndicator.startAnimating()

        // Prepend context from the text field the keyboard is attached to
        let contextBefore = textDocumentProxy.documentContextBeforeInput ?? ""
        let fullConversation: String
        if contextBefore.isEmpty {
            fullConversation = text
        } else {
            fullConversation = "[Context from field]: " + contextBefore + "\n\n" + text
        }

        fetchSuggestions(conversation: fullConversation) { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.suggestButton.setTitle("Suggest", for: .normal)
                self.suggestButton.isEnabled = true
                self.loadingIndicator.stopAnimating()

                switch result {
                case .success(let suggestions):
                    self.showSuggestions(suggestions)
                case .failure(let error):
                    self.showError(error.localizedDescription)
                }
            }
        }
    }

    @objc private func handleRetry() {
        errorBanner.isHidden = true
        handleSuggest()
    }

    // MARK: - Error UI

    private func showError(_ message: String) {
        errorLabel.text = message
        errorBanner.isHidden = false
        suggestionScrollView.isHidden = true

        // Auto-dismiss after 6 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 6) { [weak self] in
            self?.errorBanner.isHidden = true
        }

        UIAccessibility.post(notification: .announcement, argument: "Error: \(message)")
    }

    // MARK: - API

    private enum APIError: LocalizedError {
        case noUserId
        case badURL
        case networkError(String)
        case decodingError
        case serverError(Int)

        var errorDescription: String? {
            switch self {
            case .noUserId: return "Not signed in. Open TextCoach app first."
            case .badURL: return "Invalid API URL."
            case .networkError(let msg): return "Network error: \(msg)"
            case .decodingError: return "Could not read server response."
            case .serverError(let code): return "Server error (\(code)). Try again."
            }
        }
    }

    private func fetchSuggestions(conversation: String, completion: @escaping (Result<[[String: Any]], Error>) -> Void) {
        guard let userId = getUserIdFromSharedKeychain() else {
            completion(.failure(APIError.noUserId))
            return
        }

        guard let url = URL(string: "\(apiURL)/quick-suggest") else {
            completion(.failure(APIError.badURL))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("keyboard", forHTTPHeaderField: "X-TextCoach-Source")
        request.timeoutInterval = 30

        let body: [String: Any] = ["conversation": conversation, "userId": userId]

        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            completion(.failure(APIError.decodingError))
            return
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(APIError.networkError(error.localizedDescription)))
                return
            }

            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode >= 400 {
                completion(.failure(APIError.serverError(httpResponse.statusCode)))
                return
            }

            guard let data = data else {
                completion(.failure(APIError.decodingError))
                return
            }

            do {
                guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let suggestions = json["suggestions"] as? [[String: Any]] else {
                    completion(.failure(APIError.decodingError))
                    return
                }
                completion(.success(suggestions))
            } catch {
                completion(.failure(APIError.decodingError))
            }
        }.resume()
    }

    // MARK: - Display Suggestions

    private func showSuggestions(_ suggestions: [[String: Any]]) {
        // Clear existing pills
        suggestionStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        currentSuggestions = suggestions

        if suggestions.isEmpty {
            showError("No suggestions returned. Try different text.")
            return
        }

        let smallFont = UIFont(
            descriptor: (UIFont.systemFont(ofSize: 12, weight: .medium).fontDescriptor
                .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 12, weight: .medium).fontDescriptor),
            size: 12
        )

        for (index, suggestion) in suggestions.prefix(5).enumerated() {
            guard let text = suggestion["text"] as? String else { continue }
            let toneLabel = suggestion["toneLabel"] as? String ?? "Reply"
            let isRecommended = suggestion["recommended"] as? Bool ?? (index == 0)

            // Build pill title: tone + preview of message
            let preview = truncateText(text, maxLength: 30)
            let pillTitle = "\(toneLabel): \(preview)"

            let pill = UIButton(type: .system)
            pill.setTitle(pillTitle, for: .normal)
            pill.backgroundColor = pillBgColor
            pill.setTitleColor(primaryColor, for: .normal)
            pill.titleLabel?.font = smallFont
            pill.titleLabel?.lineBreakMode = .byTruncatingTail
            pill.layer.cornerRadius = 16
            pill.contentEdgeInsets = UIEdgeInsets(top: 6, left: 12, bottom: 6, right: 12)
            pill.translatesAutoresizingMaskIntoConstraints = false
            pill.tag = index

            // Best indicator: green border
            if isRecommended {
                pill.layer.borderWidth = 2
                pill.layer.borderColor = bestBorderColor.cgColor

                // Green dot before title
                let dotTitle = "\u{25CF} \(pillTitle)"
                let attributed = NSMutableAttributedString(string: dotTitle)
                attributed.addAttribute(.foregroundColor, value: bestBorderColor, range: NSRange(location: 0, length: 1))
                attributed.addAttribute(.foregroundColor, value: primaryColor, range: NSRange(location: 1, length: dotTitle.count - 1))
                attributed.addAttribute(.font, value: smallFont, range: NSRange(location: 0, length: dotTitle.count))
                pill.setAttributedTitle(attributed, for: .normal)
            }

            // Accessibility
            pill.accessibilityLabel = "\(toneLabel) suggestion: \(preview)"
            pill.accessibilityHint = "Tap to insert. Long press for full text and reasoning."
            if isRecommended {
                pill.accessibilityLabel = "Recommended. " + (pill.accessibilityLabel ?? "")
            }
            pill.accessibilityTraits = .button

            // Tap to insert
            pill.addTarget(self, action: #selector(selectSuggestion(_:)), for: .touchUpInside)

            // Long press for detail
            let longPress = UILongPressGestureRecognizer(target: self, action: #selector(longPressSuggestion(_:)))
            longPress.minimumPressDuration = 0.5
            pill.addGestureRecognizer(longPress)

            suggestionStack.addArrangedSubview(pill)
        }

        suggestionScrollView.isHidden = false
        UIAccessibility.post(notification: .layoutChanged, argument: suggestionStack.arrangedSubviews.first)
    }

    private func truncateText(_ text: String, maxLength: Int) -> String {
        if text.count <= maxLength { return text }
        let index = text.index(text.startIndex, offsetBy: maxLength)
        return String(text[..<index]) + "..."
    }

    @objc private func selectSuggestion(_ sender: UIButton) {
        let index = sender.tag
        guard index < currentSuggestions.count,
              let text = currentSuggestions[index]["text"] as? String else { return }

        textDocumentProxy.insertText(text)

        // Hide suggestions after selection
        suggestionScrollView.isHidden = true
        pasteField.text = ""
        dismissDetailOverlay()

        UIAccessibility.post(notification: .announcement, argument: "Suggestion inserted")
    }

    // MARK: - Long-Press Detail View

    @objc private func longPressSuggestion(_ gesture: UILongPressGestureRecognizer) {
        guard gesture.state == .began,
              let pill = gesture.view as? UIButton else { return }

        let index = pill.tag
        guard index < currentSuggestions.count else { return }

        let suggestion = currentSuggestions[index]
        let text = suggestion["text"] as? String ?? ""
        let reasoning = suggestion["reasoning"] as? String ?? "No reasoning provided."
        let toneLabel = suggestion["toneLabel"] as? String ?? "Reply"

        showDetailOverlay(tone: toneLabel, text: text, reasoning: reasoning)
    }

    private func showDetailOverlay(tone: String, text: String, reasoning: String) {
        dismissDetailOverlay()

        guard let inputView = self.inputView else { return }

        let overlay = UIView()
        overlay.backgroundColor = UIColor.systemBackground
        overlay.layer.cornerRadius = 12
        overlay.layer.shadowColor = UIColor.black.cgColor
        overlay.layer.shadowOpacity = 0.15
        overlay.layer.shadowRadius = 8
        overlay.layer.shadowOffset = CGSize(width: 0, height: -2)
        overlay.layer.borderWidth = 1
        overlay.layer.borderColor = primaryColor.withAlphaComponent(0.3).cgColor
        overlay.translatesAutoresizingMaskIntoConstraints = false
        inputView.addSubview(overlay)
        self.detailOverlay = overlay

        let roundedFont = UIFont(
            descriptor: (UIFont.systemFont(ofSize: 13, weight: .regular).fontDescriptor
                .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 13, weight: .regular).fontDescriptor),
            size: 13
        )
        let boldRoundedFont = UIFont(
            descriptor: (UIFont.systemFont(ofSize: 13, weight: .semibold).fontDescriptor
                .withDesign(.rounded) ?? UIFont.systemFont(ofSize: 13, weight: .semibold).fontDescriptor),
            size: 13
        )

        // Title
        let titleLabel = UILabel()
        titleLabel.text = "\(tone) Suggestion"
        titleLabel.font = boldRoundedFont
        titleLabel.textColor = primaryColor
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(titleLabel)

        // Full text
        let textLabel = UILabel()
        textLabel.text = text
        textLabel.font = roundedFont
        textLabel.textColor = .label
        textLabel.numberOfLines = 4
        textLabel.lineBreakMode = .byTruncatingTail
        textLabel.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(textLabel)

        // Reasoning
        let reasoningLabel = UILabel()
        reasoningLabel.text = "Why: \(reasoning)"
        reasoningLabel.font = UIFont(descriptor: roundedFont.fontDescriptor, size: 11)
        reasoningLabel.textColor = .secondaryLabel
        reasoningLabel.numberOfLines = 2
        reasoningLabel.lineBreakMode = .byTruncatingTail
        reasoningLabel.translatesAutoresizingMaskIntoConstraints = false
        overlay.addSubview(reasoningLabel)

        // Use button
        let useButton = UIButton(type: .system)
        useButton.setTitle("Use this", for: .normal)
        useButton.backgroundColor = primaryColor
        useButton.setTitleColor(.white, for: .normal)
        useButton.titleLabel?.font = boldRoundedFont
        useButton.layer.cornerRadius = 12
        useButton.contentEdgeInsets = UIEdgeInsets(top: 4, left: 14, bottom: 4, right: 14)
        useButton.translatesAutoresizingMaskIntoConstraints = false
        useButton.accessibilityLabel = "Use this suggestion"
        useButton.accessibilityTraits = .button
        overlay.addSubview(useButton)

        // Close button
        let closeButton = UIButton(type: .system)
        closeButton.setTitle("x", for: .normal)
        closeButton.titleLabel?.font = boldRoundedFont
        closeButton.setTitleColor(.secondaryLabel, for: .normal)
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.addTarget(self, action: #selector(dismissDetailOverlayAction), for: .touchUpInside)
        closeButton.accessibilityLabel = "Close detail view"
        closeButton.accessibilityTraits = .button
        overlay.addSubview(closeButton)

        // Store text for the use button closure workaround
        // Use accessibilityIdentifier to store the text (lightweight, no extra allocation)
        useButton.accessibilityIdentifier = text
        useButton.addTarget(self, action: #selector(useFromDetail(_:)), for: .touchUpInside)

        NSLayoutConstraint.activate([
            overlay.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 6),
            overlay.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -6),
            overlay.topAnchor.constraint(equalTo: inputView.topAnchor, constant: 2),
            overlay.bottomAnchor.constraint(equalTo: inputView.bottomAnchor, constant: -2),

            closeButton.topAnchor.constraint(equalTo: overlay.topAnchor, constant: 6),
            closeButton.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -8),
            closeButton.widthAnchor.constraint(equalToConstant: 24),
            closeButton.heightAnchor.constraint(equalToConstant: 24),

            titleLabel.topAnchor.constraint(equalTo: overlay.topAnchor, constant: 8),
            titleLabel.leadingAnchor.constraint(equalTo: overlay.leadingAnchor, constant: 12),
            titleLabel.trailingAnchor.constraint(equalTo: closeButton.leadingAnchor, constant: -4),

            textLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            textLabel.leadingAnchor.constraint(equalTo: overlay.leadingAnchor, constant: 12),
            textLabel.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -12),

            reasoningLabel.topAnchor.constraint(equalTo: textLabel.bottomAnchor, constant: 4),
            reasoningLabel.leadingAnchor.constraint(equalTo: overlay.leadingAnchor, constant: 12),
            reasoningLabel.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -12),

            useButton.bottomAnchor.constraint(equalTo: overlay.bottomAnchor, constant: -8),
            useButton.trailingAnchor.constraint(equalTo: overlay.trailingAnchor, constant: -12),
            useButton.heightAnchor.constraint(equalToConstant: 28),
        ])

        // Accessibility
        overlay.accessibilityLabel = "\(tone) suggestion detail. \(text). Reasoning: \(reasoning)"
        overlay.isAccessibilityElement = false
        UIAccessibility.post(notification: .layoutChanged, argument: textLabel)
    }

    @objc private func useFromDetail(_ sender: UIButton) {
        guard let text = sender.accessibilityIdentifier else { return }
        textDocumentProxy.insertText(text)
        dismissDetailOverlay()
        suggestionScrollView.isHidden = true
        pasteField.text = ""
        UIAccessibility.post(notification: .announcement, argument: "Suggestion inserted")
    }

    @objc private func dismissDetailOverlayAction() {
        dismissDetailOverlay()
    }

    private func dismissDetailOverlay() {
        detailOverlay?.removeFromSuperview()
        detailOverlay = nil
    }

    // MARK: - Shared Keychain

    private func getUserIdFromSharedKeychain() -> String? {
        let defaults = UserDefaults(suiteName: "group.com.textcoach.app")
        return defaults?.string(forKey: "userId")
    }
}
