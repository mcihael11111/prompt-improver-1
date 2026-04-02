import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Lazy initialization - create client only when needed
let supabaseClient = null;

function getSupabaseClient() {
	if (!supabaseClient) {
		supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
			auth: {
				storage: {
					getItem: async (key) => {
						const result = await chrome.storage.local.get([key]);
						return result[key] || null;
					},
					setItem: async (key, value) => {
						await chrome.storage.local.set({ [key]: value });
					},
					removeItem: async (key) => {
						await chrome.storage.local.remove([key]);
					},
				},
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
			},
		});
	}
	return supabaseClient;
}

// Keep service worker alive during OAuth flow
let keepAliveInterval = null;
let oauthInProgress = false;

function startKeepAlive() {
	if (keepAliveInterval) return;

	keepAliveInterval = setInterval(() => {
		chrome.runtime.getPlatformInfo(() => {
			// Just keep alive
		});
	}, 20000); // Every 20 seconds
}

function stopKeepAlive() {
	if (keepAliveInterval) {
		clearInterval(keepAliveInterval);
		keepAliveInterval = null;
	}
}

/*
// Check/create user when service worker starts
chrome.runtime.onStartup.addListener(async () => {
	console.log("Browser started, checking auth...");
	await ensureUserExists();
});
*/
export async function ensureUserExists() {
	try {
		const supabase = getSupabaseClient();

		// Check if we have an existing session
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session) {
			console.log("Session found:", session.user.email || "anonymous");

			// Verify session is still valid by getting user
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				console.log("Session invalid, creating new anonymous user");
				await signInAnonymously();
			}
		} else {
			console.log("No session, creating anonymous user");
			await signInAnonymously();
		}
	} catch (error) {
		console.error("Error ensuring user exists:", error);
		// Attempt to create anonymous user as fallback
		// await signInAnonymously();
	}
}

async function signInAnonymously() {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.auth.signInAnonymously();

	if (error) {
		console.error("Error signing in anonymously:", error);
		return null;
	}

	chrome.storage.local.set({
		userId: data.user.id,
	});

	console.log("Anonymous user created:", data.user.id);
	return data.user;
}

export async function signInWithGoogle(stripeLink?: string) {
	try {
		// Prevent multiple simultaneous OAuth flows
		if (oauthInProgress) {
			console.log("OAuth flow already in progress, ignoring duplicate request");
			return;
		}
		oauthInProgress = true;

		const supabase = getSupabaseClient();

		// Keep service worker alive during OAuth
		startKeepAlive();

		// Get current user to check if anonymous
		const {
			data: { user: currentUser },
		} = await supabase.auth.getUser();
		const isAnonymous = currentUser?.is_anonymous || false;

		console.log("Starting Google sign-in, anonymous:", isAnonymous);

		if (isAnonymous) {
			console.log("Will link anonymous user to Google account...");

			// Use linkIdentity for anonymous users
			const { data, error } = await supabase.auth.linkIdentity({
				provider: "google",
				options: {
					redirectTo: chrome.identity.getRedirectURL(),
					skipBrowserRedirect: true,
					queryParams: {
						access_type: "offline",
						prompt: "select_account consent",
					},
				},
			});

			if (error) {
				console.error("Error getting linkIdentity URL:", error);
				notifyAuthError(error.message || "Failed to initiate Google sign-in");
				oauthInProgress = false;
				stopKeepAlive();
				throw error;
			}

			console.log("Launching OAuth flow with URL:", data.url);

			// Store flag to help recover if service worker restarts
			await chrome.storage.local.set({
				pendingOAuth: true,
				oauthStartTime: Date.now(),
				oauthStripeLink: stripeLink,
			});

			// Launch Chrome's OAuth flow
			chrome.identity.launchWebAuthFlow(
				{
					url: data.url,
					interactive: true,
				},
				async (redirectUri) => {
					console.log("OAuth callback received");

					if (chrome.runtime.lastError) {
						console.error("OAuth error:", chrome.runtime.lastError);
						notifyAuthError(chrome.runtime.lastError.message || "Authentication was cancelled or failed");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						oauthInProgress = false;
						stopKeepAlive();
						return;
					}

					if (!redirectUri) {
						console.error("No redirect URI received");
						notifyAuthError("No authentication response received. Please try again.");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						oauthInProgress = false;
						stopKeepAlive();
						return;
					}

					console.log("Redirect URI received:", redirectUri);

					try {
						// Get fresh client instance
						const supabase = getSupabaseClient();

						// Parse the callback URL - check both hash and query params
						const url = new URL(redirectUri);
						console.log("URL hash:", url.hash);
						console.log("URL search:", url.search);

						// Try hash first (implicit flow)
						const hashParams = new URLSearchParams(url.hash.substring(1));
						
						// Check for errors in the callback URL
						const error = hashParams.get("error");
						const errorCode = hashParams.get("error_code");
						const errorDescription = hashParams.get("error_description");
						
						if (error) {
							console.error("OAuth error in callback URL:", { error, errorCode, errorDescription });
							
							// Special handling for identity_already_exists - sign in the existing user
							if (errorCode === "identity_already_exists") {
								console.log("Identity already linked to another user, signing in that user instead...");
								
								// Sign out current anonymous user
								await supabase.auth.signOut();
								
								// Start a fresh OAuth sign-in (non-linking)
								const { data: signInData, error: signInError } = await supabase.auth.signInWithOAuth({
									provider: "google",
									options: {
										redirectTo: chrome.identity.getRedirectURL(),
										queryParams: {
											access_type: "offline",
											prompt: "select_account consent",
										},
									},
								});
								
								if (signInError) {
									console.error("Error starting sign-in for existing user:", signInError);
									notifyAuthError(signInError.message || "Failed to sign in with existing account");
									await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
									oauthInProgress = false;
									stopKeepAlive();
									return;
								}
								
								// Launch OAuth flow again for the existing user
								chrome.identity.launchWebAuthFlow(
									{
										url: signInData.url,
										interactive: true,
									},
									async (retryRedirectUri) => {
										if (chrome.runtime.lastError || !retryRedirectUri) {
											console.error("Retry OAuth failed:", chrome.runtime.lastError);
											notifyAuthError("Failed to sign in with existing account");
											await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
											oauthInProgress = false;
											stopKeepAlive();
											return;
										}
										
										// Process the new callback
										const retryUrl = new URL(retryRedirectUri);
										const retryHashParams = new URLSearchParams(retryUrl.hash.substring(1));
										const retryAccessToken = retryHashParams.get("access_token");
										const retryRefreshToken = retryHashParams.get("refresh_token");
										
										if (retryAccessToken) {
											const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
												access_token: retryAccessToken,
												refresh_token: retryRefreshToken,
											});
											
											if (sessionError) {
												console.error("Error setting session for existing user:", sessionError);
												notifyAuthError(sessionError.message || "Failed to sign in with existing account");
											} else {
												console.log("Successfully signed in with existing user:", sessionData.user.email);
												
												await chrome.storage.local.set({
													lastAuthSuccess: Date.now(),
													userId: sessionData.user.id,
													userEmail: sessionData.user.email,
												});
												
												await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
												
												notifyAuthChange("SIGNED_IN", sessionData.user);
												if (stripeLink) {
													chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
												}
											}
										} else {
											// Try PKCE flow
											const retrySearchParams = new URLSearchParams(retryUrl.search);
											const code = retrySearchParams.get("code");
											
											if (code) {
												const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
												
												if (exchangeError) {
													console.error("Error exchanging code for existing user:", exchangeError);
													notifyAuthError(exchangeError.message || "Failed to sign in with existing account");
												} else {
													console.log("Successfully signed in with existing user:", sessionData.user.email);
													
													await chrome.storage.local.set({
														lastAuthSuccess: Date.now(),
														userId: sessionData.user.id,
														userEmail: sessionData.user.email,
													});
													
													await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
													
													notifyAuthChange("SIGNED_IN", sessionData.user);
													if (stripeLink) {
														chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
													}
												}
											} else {
												notifyAuthError("Failed to sign in with existing account");
											}
										}
										
										await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
										oauthInProgress = false;
										stopKeepAlive();
									}
								);
								return; // Exit current callback processing
							}
							
							// For other errors, show error message
							let errorMessage = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error;
							if (errorCode) {
								errorMessage = `[${errorCode}] ${errorMessage}`;
							}
							notifyAuthError(errorMessage);
							await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
							oauthInProgress = false;
							stopKeepAlive();
							return;
						}
						
						let access_token = hashParams.get("access_token");
						let refresh_token = hashParams.get("refresh_token");

						// If not in hash, try query params (PKCE flow)
						if (!access_token) {
							const searchParams = new URLSearchParams(url.search);
							
							// Check for errors in query params too
							const queryError = searchParams.get("error");
							const queryErrorCode = searchParams.get("error_code");
							const queryErrorDescription = searchParams.get("error_description");
							
							if (queryError) {
								console.error("OAuth error in query params:", { queryError, queryErrorCode, queryErrorDescription });
								let errorMessage = queryErrorDescription ? decodeURIComponent(queryErrorDescription.replace(/\+/g, ' ')) : queryError;
								if (queryErrorCode) {
									errorMessage = `[${queryErrorCode}] ${errorMessage}`;
								}
								notifyAuthError(errorMessage);
								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
								oauthInProgress = false;
								stopKeepAlive();
								return;
							}
							
							const code = searchParams.get("code");
							console.log("Auth code from query:", code);

							if (code) {
								// Exchange code for session using Supabase
								const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

								if (exchangeError) {
									console.error("Error exchanging code for session:", exchangeError);
									notifyAuthError(exchangeError.message || "Failed to complete Google sign-in");
									await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
									oauthInProgress = false;
									stopKeepAlive();
									return;
								}

								console.log("Successfully exchanged code for session!");
								console.log("User:", sessionData.user.email);

								await chrome.storage.local.set({
									lastAuthSuccess: Date.now(),
									userId: sessionData.user.id,
									userEmail: sessionData.user.email,
								});

								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);

								notifyAuthChange("SIGNED_IN", sessionData.user);
								if (stripeLink) {
									chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
								}
								oauthInProgress = false;
								stopKeepAlive();
								return;
							}
						}

						console.log("Tokens extracted:", {
							hasAccessToken: !!access_token,
							hasRefreshToken: !!refresh_token,
						});

						if (access_token) {
							// Set the new session (anonymous user is now linked)
							const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
								access_token,
								refresh_token,
							});

							if (sessionError) {
								console.error("Error setting session:", sessionError);
								notifyAuthError(sessionError.message || "Failed to establish authenticated session");
								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
							} else {
								console.log("Successfully linked anonymous user to Google!");
								console.log("User:", sessionData.user.email);

								await chrome.storage.local.set({
									lastAuthSuccess: Date.now(),
									userId: sessionData.user.id,
									userEmail: sessionData.user.email,
								});

								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);

								notifyAuthChange("SIGNED_IN", sessionData.user);
								if (stripeLink) {
									chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
								}
							}
						} else {
							console.error("No access token in redirect URI");
							notifyAuthError("Authentication failed: No access token received");
							await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						}
					} catch (error) {
						console.error("Error processing OAuth callback:", error);
						notifyAuthError(error.message || "Failed to process authentication response");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
					}

					oauthInProgress = false;
					stopKeepAlive();
				}
			);
		} else {
			// Similar handling for non-anonymous users
			console.log("Regular Google sign in...");

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: chrome.identity.getRedirectURL(),
					queryParams: {
						access_type: "offline",
						prompt: "select_account consent",
					},
				},
			});

			if (error) {
				console.error("Error getting OAuth URL:", error);
				notifyAuthError(error.message || "Failed to initiate Google sign-in");
				oauthInProgress = false;
				stopKeepAlive();
				throw error;
			}

			console.log("Launching OAuth flow with URL:", data.url);

			await chrome.storage.local.set({
				pendingOAuth: true,
				oauthStartTime: Date.now(),
				oauthStripeLink: stripeLink,
			});

			chrome.identity.launchWebAuthFlow(
				{
					url: data.url,
					interactive: true,
				},
				async (redirectUri) => {
					console.log("OAuth callback received");

					if (chrome.runtime.lastError) {
						console.error("OAuth error:", chrome.runtime.lastError);
						notifyAuthError(chrome.runtime.lastError.message || "Authentication was cancelled or failed");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						oauthInProgress = false;
						stopKeepAlive();
						return;
					}

					if (!redirectUri) {
						console.error("No redirect URI received");
						notifyAuthError("No authentication response received. Please try again.");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						oauthInProgress = false;
						stopKeepAlive();
						return;
					}

					console.log("Redirect URI received:", redirectUri);

					try {
						const supabase = getSupabaseClient();
						const url = new URL(redirectUri);
						console.log("URL hash:", url.hash);
						console.log("URL search:", url.search);

						// Try hash first (implicit flow)
						const hashParams = new URLSearchParams(url.hash.substring(1));
						
						// Check for errors in the callback URL
						const error = hashParams.get("error");
						const errorCode = hashParams.get("error_code");
						const errorDescription = hashParams.get("error_description");
						
						if (error) {
							console.error("OAuth error in callback URL:", { error, errorCode, errorDescription });
							let errorMessage = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : error;
							if (errorCode) {
								errorMessage = `[${errorCode}] ${errorMessage}`;
							}
							notifyAuthError(errorMessage);
							await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
							oauthInProgress = false;
							stopKeepAlive();
							return;
						}
						
						let access_token = hashParams.get("access_token");
						let refresh_token = hashParams.get("refresh_token");

						// If not in hash, try query params (PKCE flow)
						if (!access_token) {
							const searchParams = new URLSearchParams(url.search);
							
							// Check for errors in query params too
							const queryError = searchParams.get("error");
							const queryErrorCode = searchParams.get("error_code");
							const queryErrorDescription = searchParams.get("error_description");
							
							if (queryError) {
								console.error("OAuth error in query params:", { queryError, queryErrorCode, queryErrorDescription });
								let errorMessage = queryErrorDescription ? decodeURIComponent(queryErrorDescription.replace(/\+/g, ' ')) : queryError;
								if (queryErrorCode) {
									errorMessage = `[${queryErrorCode}] ${errorMessage}`;
								}
								notifyAuthError(errorMessage);
								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
								oauthInProgress = false;
								stopKeepAlive();
								return;
							}
							
							const code = searchParams.get("code");
							console.log("Auth code from query:", code);

							if (code) {
								// Exchange code for session using Supabase
								const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

								if (exchangeError) {
									console.error("Error exchanging code for session:", exchangeError);
									notifyAuthError(exchangeError.message || "Failed to complete Google sign-in");
									await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
									oauthInProgress = false;
									stopKeepAlive();
									return;
								}

								console.log("Successfully signed in with Google!");
								console.log("User:", sessionData.user.email);

								await chrome.storage.local.set({
									lastAuthSuccess: Date.now(),
									userId: sessionData.user.id,
									userEmail: sessionData.user.email,
								});

								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);

								notifyAuthChange("SIGNED_IN", sessionData.user);
								if (stripeLink) {
									chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
								}
								oauthInProgress = false;
								stopKeepAlive();
								return;
							}
						}

						console.log("Tokens extracted:", {
							hasAccessToken: !!access_token,
							hasRefreshToken: !!refresh_token,
						});

						if (access_token) {
							const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
								access_token,
								refresh_token,
							});

							if (sessionError) {
								console.error("Error setting session:", sessionError);
								notifyAuthError(sessionError.message || "Failed to establish authenticated session");
								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
							} else {
								console.log("Successfully signed in with Google!");
								console.log("User:", sessionData.user.email);

								await chrome.storage.local.set({
									lastAuthSuccess: Date.now(),
									userId: sessionData.user.id,
									userEmail: sessionData.user.email,
								});

								await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);

								notifyAuthChange("SIGNED_IN", sessionData.user);
								if (stripeLink) {
									chrome.tabs.create({ url: stripeLink + "?locked_prefilled_email=" + sessionData.user.email });
								}
							}
						} else {
							console.error("No access token in redirect URI");
							notifyAuthError("Authentication failed: No access token received");
							await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
						}
					} catch (error) {
						console.error("Error processing OAuth callback:", error);
						notifyAuthError(error.message || "Failed to process authentication response");
						await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
					}

					oauthInProgress = false;
					stopKeepAlive();
				}
			);
		}
	} catch (error) {
		oauthInProgress = false;
		stopKeepAlive();
		console.error("Error in Google sign-in:", error);
		notifyAuthError(error.message || "Failed to initiate Google sign-in");
		await chrome.storage.local.remove(["pendingOAuth", "oauthStartTime", "oauthStripeLink"]);
	}
}

export async function signOut() {
	const supabase = getSupabaseClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error("Error signing out:", error);
		return;
	}

	chrome.storage.local.remove("userId");
	chrome.storage.local.remove("userEmail");

	console.log("Signed out successfully");

	notifyAuthChange("SIGNED_OUT", null);
}

export async function getCurrentUser() {
	try {
		const supabase = getSupabaseClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.error("Error getting user:", error);
			// If error, try to ensure we have a user
			await ensureUserExists();
			return null;
		}

		return user;
	} catch (error) {
		console.error("Error in getCurrentUser:", error);
		return null;
	}
}

function notifyAuthChange(event, user) {
	// Try to notify all extension contexts
	chrome.runtime
		.sendMessage({
			type: "AUTH_STATE_CHANGED",
			event,
			user,
		})
		.catch(() => {
			// No listeners, that's ok
		});

	// Also try to notify all tabs
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			chrome.tabs
				.sendMessage(tab.id, {
					type: "AUTH_STATE_CHANGED",
					event,
					user,
				})
				.catch(() => {
					// Tab might not have content script
				});
		});
	});
}

function notifyAuthError(error: string) {
	// Try to notify all extension contexts
	chrome.runtime
		.sendMessage({
			type: "AUTH_ERROR",
			error,
		})
		.catch(() => {
			// No listeners, that's ok
		});

	// Also try to notify all tabs
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			chrome.tabs
				.sendMessage(tab.id, {
					type: "AUTH_ERROR",
					error,
				})
				.catch(() => {
					// Tab might not have content script
				});
		});
	});
}
