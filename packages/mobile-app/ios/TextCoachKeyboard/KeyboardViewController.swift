import UIKit

/// TextCoach Custom Keyboard Extension
///
/// This is a native Swift keyboard extension (NOT React Native) due to iOS memory limits (~30MB).
/// It provides Quick Suggest functionality directly from the keyboard.
///
/// Flow:
/// 1. User taps TextCoach icon on keyboard toolbar
/// 2. Compact UI appears: paste field + "Suggest" button
/// 3. Suggestions appear as tappable pills above the keyboard
/// 4. Tap a suggestion to insert it into the active text field
///
/// Auth: Shares credentials with main app via App Groups / shared Keychain
/// API: Calls the TextCoach backend directly via URLSession

class KeyboardViewController: UIInputViewController {

    // MARK: - Properties

    private var suggestionBar: UIStackView!
    private var inputContainer: UIView!
    private var pasteField: UITextField!
    private var suggestButton: UIButton!
    private var loadingIndicator: UIActivityIndicatorView!
    private var isShowingInput = false

    private let apiURL = "https://textcoach-api.onrender.com"
    private let primaryColor = UIColor(red: 118/255, green: 22/255, blue: 208/255, alpha: 1)

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    // MARK: - UI Setup

    private func setupUI() {
        guard let inputView = self.inputView else { return }
        inputView.translatesAutoresizingMaskIntoConstraints = false

        // Suggestion bar (shown when suggestions are available)
        suggestionBar = UIStackView()
        suggestionBar.axis = .horizontal
        suggestionBar.distribution = .fillEqually
        suggestionBar.spacing = 8
        suggestionBar.translatesAutoresizingMaskIntoConstraints = false
        suggestionBar.isHidden = true
        inputView.addSubview(suggestionBar)

        // Input container (paste field + suggest button)
        inputContainer = UIView()
        inputContainer.translatesAutoresizingMaskIntoConstraints = false
        inputContainer.backgroundColor = UIColor.systemBackground
        inputView.addSubview(inputContainer)

        // Paste field
        pasteField = UITextField()
        pasteField.placeholder = "Paste conversation..."
        pasteField.borderStyle = .roundedRect
        pasteField.font = .systemFont(ofSize: 14)
        pasteField.translatesAutoresizingMaskIntoConstraints = false
        inputContainer.addSubview(pasteField)

        // Suggest button
        suggestButton = UIButton(type: .system)
        suggestButton.setTitle("Suggest", for: .normal)
        suggestButton.backgroundColor = primaryColor
        suggestButton.setTitleColor(.white, for: .normal)
        suggestButton.titleLabel?.font = .systemFont(ofSize: 14, weight: .medium)
        suggestButton.layer.cornerRadius = 16
        suggestButton.translatesAutoresizingMaskIntoConstraints = false
        suggestButton.addTarget(self, action: #selector(handleSuggest), for: .touchUpInside)
        inputContainer.addSubview(suggestButton)

        // Loading indicator
        loadingIndicator = UIActivityIndicatorView(style: .medium)
        loadingIndicator.color = primaryColor
        loadingIndicator.translatesAutoresizingMaskIntoConstraints = false
        loadingIndicator.hidesWhenStopped = true
        inputContainer.addSubview(loadingIndicator)

        // TextCoach toggle button (main keyboard toolbar)
        let toggleButton = UIButton(type: .system)
        toggleButton.setTitle("TC", for: .normal)
        toggleButton.backgroundColor = primaryColor
        toggleButton.setTitleColor(.white, for: .normal)
        toggleButton.titleLabel?.font = .systemFont(ofSize: 12, weight: .bold)
        toggleButton.layer.cornerRadius = 14
        toggleButton.translatesAutoresizingMaskIntoConstraints = false
        toggleButton.addTarget(self, action: #selector(toggleInput), for: .touchUpInside)
        inputView.addSubview(toggleButton)

        // Next keyboard button
        let nextKeyboardButton = UIButton(type: .system)
        nextKeyboardButton.setTitle("🌐", for: .normal)
        nextKeyboardButton.translatesAutoresizingMaskIntoConstraints = false
        nextKeyboardButton.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
        inputView.addSubview(nextKeyboardButton)

        // Layout constraints
        NSLayoutConstraint.activate([
            // Input container
            inputContainer.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            inputContainer.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            inputContainer.topAnchor.constraint(equalTo: inputView.topAnchor, constant: 4),
            inputContainer.heightAnchor.constraint(equalToConstant: 44),

            // Paste field
            pasteField.leadingAnchor.constraint(equalTo: inputContainer.leadingAnchor),
            pasteField.centerYAnchor.constraint(equalTo: inputContainer.centerYAnchor),
            pasteField.trailingAnchor.constraint(equalTo: suggestButton.leadingAnchor, constant: -8),
            pasteField.heightAnchor.constraint(equalToConstant: 36),

            // Suggest button
            suggestButton.trailingAnchor.constraint(equalTo: inputContainer.trailingAnchor),
            suggestButton.centerYAnchor.constraint(equalTo: inputContainer.centerYAnchor),
            suggestButton.widthAnchor.constraint(equalToConstant: 80),
            suggestButton.heightAnchor.constraint(equalToConstant: 32),

            // Loading
            loadingIndicator.centerXAnchor.constraint(equalTo: suggestButton.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: suggestButton.centerYAnchor),

            // Suggestion bar
            suggestionBar.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            suggestionBar.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            suggestionBar.topAnchor.constraint(equalTo: inputContainer.bottomAnchor, constant: 4),
            suggestionBar.heightAnchor.constraint(equalToConstant: 36),

            // Toggle button
            toggleButton.leadingAnchor.constraint(equalTo: inputView.leadingAnchor, constant: 8),
            toggleButton.bottomAnchor.constraint(equalTo: inputView.bottomAnchor, constant: -8),
            toggleButton.widthAnchor.constraint(equalToConstant: 28),
            toggleButton.heightAnchor.constraint(equalToConstant: 28),

            // Next keyboard
            nextKeyboardButton.trailingAnchor.constraint(equalTo: inputView.trailingAnchor, constant: -8),
            nextKeyboardButton.bottomAnchor.constraint(equalTo: inputView.bottomAnchor, constant: -8),
        ])
    }

    // MARK: - Actions

    @objc private func toggleInput() {
        isShowingInput.toggle()
        inputContainer.isHidden = !isShowingInput
    }

    @objc private func handleSuggest() {
        guard let text = pasteField.text, !text.isEmpty else { return }

        suggestButton.isHidden = true
        loadingIndicator.startAnimating()

        fetchSuggestions(conversation: text) { [weak self] suggestions in
            DispatchQueue.main.async {
                self?.suggestButton.isHidden = false
                self?.loadingIndicator.stopAnimating()
                self?.showSuggestions(suggestions)
            }
        }
    }

    // MARK: - API

    private func fetchSuggestions(conversation: String, completion: @escaping ([[String: Any]]) -> Void) {
        guard let userId = getUserIdFromSharedKeychain() else {
            completion([])
            return
        }

        guard let url = URL(string: "\(apiURL)/quick-suggest") else {
            completion([])
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("keyboard", forHTTPHeaderField: "X-TextCoach-Source")

        let body: [String: Any] = ["conversation": conversation, "userId": userId]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, _, error in
            guard let data = data, error == nil,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let suggestions = json["suggestions"] as? [[String: Any]] else {
                completion([])
                return
            }
            completion(suggestions)
        }.resume()
    }

    // MARK: - Display Suggestions

    private func showSuggestions(_ suggestions: [[String: Any]]) {
        // Clear existing
        suggestionBar.arrangedSubviews.forEach { $0.removeFromSuperview() }

        for suggestion in suggestions.prefix(3) {
            guard let text = suggestion["text"] as? String,
                  let toneLabel = suggestion["toneLabel"] as? String else { continue }

            let pill = UIButton(type: .system)
            pill.setTitle(toneLabel, for: .normal)
            pill.backgroundColor = UIColor(red: 237/255, green: 227/255, blue: 250/255, alpha: 1)
            pill.setTitleColor(primaryColor, for: .normal)
            pill.titleLabel?.font = .systemFont(ofSize: 12, weight: .medium)
            pill.layer.cornerRadius = 16
            pill.tag = suggestionBar.arrangedSubviews.count
            pill.addTarget(self, action: #selector(selectSuggestion(_:)), for: .touchUpInside)

            // Store full text as accessibility identifier (lightweight storage)
            pill.accessibilityIdentifier = text

            suggestionBar.addArrangedSubview(pill)
        }

        suggestionBar.isHidden = suggestions.isEmpty
    }

    @objc private func selectSuggestion(_ sender: UIButton) {
        guard let text = sender.accessibilityIdentifier else { return }
        textDocumentProxy.insertText(text)

        // Hide suggestions after selection
        suggestionBar.isHidden = true
        pasteField.text = ""
    }

    // MARK: - Shared Keychain

    private func getUserIdFromSharedKeychain() -> String? {
        // Read userId from shared App Group UserDefaults
        // The main TextCoach app writes this when the user signs in
        let defaults = UserDefaults(suiteName: "group.com.textcoach.app")
        return defaults?.string(forKey: "userId")
    }
}
