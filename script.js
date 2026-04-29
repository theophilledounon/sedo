

const sidebar = document.getElementById("sidebar");
const burger = document.getElementById("burger");
const overlay = document.getElementById("overlay");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const STORAGE_KEYS = {
	completed: "completedSections",
	lastSection: "lastSectionId",
	quizStatus: "quizStatus",
};

const allSections = Array.from(document.querySelectorAll("main.content > section"));
const sidebarLinks = Array.from(document.querySelectorAll(".sidebar__link"));
const completionButtons = Array.from(document.querySelectorAll(".complete-btn"));
const quizzes = Array.from(document.querySelectorAll(".quiz"));
const module2Link = document.querySelector('.sidebar__link[href="#module-2"]');
const module2Start = document.getElementById("startModule2");
const module3Start = document.getElementById("startModule3");
const module4Start = document.getElementById("startModule4");
const module5Start = document.getElementById("startModule5");
const nextModuleButton = document.getElementById("nextModule");
const nextModule3Button = document.getElementById("nextModule3");
const nextModule4Button = document.getElementById("nextModule4");
const nextModule5Button = document.getElementById("nextModule5");
// Date d'ouverture : Lundi 26 Janvier 2026 à 06h00 (GMT+1)
const OPENING_DATE_MOD2 = new Date("2026-01-26T06:00:00+01:00");
// Date d'ouverture : Lundi 02 Fevrier 2026 à 06h00 (GMT+1)
const OPENING_DATE_MOD3 = new Date("2026-02-02T06:00:00+01:00");
// Date d'ouverture : Lundi 16 Fevrier 2026 à 06h00 (GMT+1)
const OPENING_DATE_MOD4 = new Date("2026-02-16T06:00:00+01:00");
// Date d'ouverture : Mardi 25 Fevrier 2026 à 00h00 (UTC+1)
const OPENING_DATE_MOD5 = new Date("2026-02-25T00:00:00+01:00");

const toggleMenu = (open) => {
	// Desktop Mode (> 1024px)
	if (window.innerWidth > 1024) {
		const isHidden = sidebar.classList.contains("is-hidden");
		// If 'open' is undefined, we toggle: if hidden -> true (show), if visible -> false (hide)
		// If 'open' is defined, we use it directly as the target visibility state
		const shouldBeVisible = open !== undefined ? open : isHidden;
		
		sidebar.classList.toggle("is-hidden", !shouldBeVisible);
		
		const content = document.querySelector('.content');
		if (content) {
			// If visible, not full width. If hidden, full width.
			content.classList.toggle("is-full", !shouldBeVisible);
		}
		
		burger.setAttribute("aria-expanded", shouldBeVisible ? "true" : "false");
	} 
	// Mobile Mode (<= 1024px)
	else {
		const isOpen = open !== undefined ? open : !sidebar.classList.contains("is-open");
		sidebar.classList.toggle("is-open", isOpen);
		overlay.classList.toggle("is-active", isOpen); // Only relevant for mobile overlay
		burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
	}
};

burger.addEventListener("click", () => toggleMenu());
overlay.addEventListener("click", () => toggleMenu(false));

const getStoredArray = (key) => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch (error) {
		return [];
	}
};

const setStoredArray = (key, value) => {
	localStorage.setItem(key, JSON.stringify(value));
};

const getQuizStatus = () => {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.quizStatus);
		return raw ? JSON.parse(raw) : {};
	} catch (error) {
		return {};
	}
};

const setQuizStatus = (status) => {
	localStorage.setItem(STORAGE_KEYS.quizStatus, JSON.stringify(status));
};

const showSection = (sectionId, { updateHistory = true } = {}) => {
	const target = sectionId ? document.getElementById(sectionId) : null;
	if (!target) {
		return;
	}

	allSections.forEach((section) => {
		const isTarget = section === target;
		section.classList.toggle("is-hidden", !isTarget);
		section.setAttribute("aria-hidden", isTarget ? "false" : "true");
	});

	window.scrollTo(0, 0);

	if (updateHistory) {
		history.replaceState(null, "", `#${sectionId}`);
	}

	localStorage.setItem(STORAGE_KEYS.lastSection, sectionId);

	sidebarLinks.forEach((link) => {
		const id = link.getAttribute("href")?.replace("#", "");
		link.classList.toggle("is-active", id === sectionId);
	});

	manageLockOverlay(sectionId);
};

const updateProgress = () => {
	const completed = getStoredArray(STORAGE_KEYS.completed);
	// Calculate progress based on unique completed modules/milestones
	// A milestone is marked by a completion button
	let milestoneCount = 0;
	completionButtons.forEach(btn => {
		const section = btn.closest("section");
		if (section && completed.includes(section.id)) {
			milestoneCount++;
		}
	});
	
	const total = completionButtons.length;
	const progress = total > 0 ? Math.round((milestoneCount / total) * 100) : 0;
	progressBar.style.width = `${progress}%`;
	progressText.textContent = `${progress}%`;

	// Mettre à jour la barre de progression dans la sidebar
	const sidebarFill = document.getElementById("sidebarProgressFill");
	if (sidebarFill) {
		sidebarFill.style.width = `${progress}%`;
	}
};

const markSidebarStatus = () => {
	const completed = getStoredArray(STORAGE_KEYS.completed);

	sidebarLinks.forEach((link) => {
		const id = link.getAttribute("href")?.replace("#", "");
		const isDone = id && completed.includes(id);
		link.classList.toggle("is-done", Boolean(isDone));
		if (isDone && !link.querySelector(".sidebar__done")) {
			const check = document.createElement("span");
			check.className = "sidebar__done";
			check.textContent = "âœ“";
			link.appendChild(check);
		}
	});
};

const isModule2Locked = () => {
	return { locked: false };
};

const isModule3Locked = () => {
	return { locked: false };
};

const isModule4Locked = () => {
	const now = new Date();
	if (now < OPENING_DATE_MOD4) {
		return { locked: true, reason: 'time', targetDate: OPENING_DATE_MOD4 };
	}
	// Check if Module 3 is completed
	const completed = getStoredArray(STORAGE_KEYS.completed);
	if (!completed.includes("module-3")) {
		return { locked: true, reason: 'prereq' };
	}
	return { locked: false };
};

const isModule5Locked = () => {
	const now = new Date();
	if (now < OPENING_DATE_MOD5) {
		return { locked: true, reason: 'time', targetDate: OPENING_DATE_MOD5 };
	}
	// Check if Module 4 is completed
	const completed = getStoredArray(STORAGE_KEYS.completed);
	if (!completed.includes("module-4")) {
		return { locked: true, reason: 'prereq' };
	}
	return { locked: false };
};

const formatTimeRemaining = (targetDate) => {
	const now = new Date();
	const diff = targetDate - now;
	
	if (diff <= 0) return "00j 00h 00m 00s";

	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return `${days}j ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

const manageLockOverlay = (sectionId) => {
	const section = document.getElementById(sectionId);
	if (!section) return;

	let lockState = { locked: false };
	let prereqName = "";
	let moduleName = "";

	if (sectionId.startsWith('module-2')) {
		lockState = isModule2Locked();
		prereqName = "le Module 1";
		moduleName = "Le Module 2";
	} else if (sectionId.startsWith('module-3')) {
		lockState = isModule3Locked();
		prereqName = "le Module 2";
		moduleName = "Le Module 3";
	} else if (sectionId.startsWith('module-4')) {
		lockState = isModule4Locked();
		prereqName = "le Module 3";
		moduleName = "Le Module 4";
	} else if (sectionId.startsWith('module-5')) {
		lockState = isModule5Locked();
		prereqName = "le Module 4";
		moduleName = "Le Module 5";
	} else {
		return;
	}

	let overlay = section.querySelector('.lock-overlay');
	window.lockIntervals = window.lockIntervals || {};

	if (lockState.locked) {
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.className = 'lock-overlay';
			
			// Get actual module height to prevent layout shifts
			const moduleHeight = section.offsetHeight;
			if (moduleHeight > 0) {
				overlay.style.minHeight = moduleHeight + 'px';
			}
			
			overlay.innerHTML = `
				<div class="lock-icon">ðŸ”’</div>
				<div class="lock-message">
					${lockState.reason === 'time' 
						? "Ce module ouvrira bientôt..." 
						: "Terminez " + prereqName + " pour accéder à ce cours."}
				</div>
				${lockState.reason === 'time' ? '<div class="lock-timer" id="lockTimer">--:--:--</div>' : ''}
			`;
			section.appendChild(overlay);
			
			// Ensure relative positioning
			if (getComputedStyle(section).position === 'static') {
				section.style.position = 'relative';
			}
			
			// Scroll to top of section to ensure lock is visible
			requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth' }));
		}

		const timerEl = overlay.querySelector('#lockTimer');
		const msgEl = overlay.querySelector('.lock-message');

		if (lockState.reason === 'time') {
			if (!window.lockIntervals[sectionId]) {
				const updateTimer = () => {
					// Re-check lock state dynamically
					let currentLock;
					if (sectionId.startsWith('module-2')) currentLock = isModule2Locked();
					else if (sectionId.startsWith('module-3')) currentLock = isModule3Locked();
					else if (sectionId.startsWith('module-4')) currentLock = isModule4Locked();
					else if (sectionId.startsWith('module-5')) currentLock = isModule5Locked();
					else currentLock = { locked: false };
					
					if (!currentLock.locked) {
						clearInterval(window.lockIntervals[sectionId]);
						delete window.lockIntervals[sectionId];
						overlay.remove();
						updateModuleLocks();
						return;
					}
					
					// Use the correct targetDate
					const timeLeft = formatTimeRemaining(currentLock.targetDate);
					if (timerEl) timerEl.textContent = timeLeft;
				};
				updateTimer();
				window.lockIntervals[sectionId] = setInterval(updateTimer, 1000);
			}
			if (msgEl) msgEl.textContent = `${moduleName} sera disponible dans :`;
		} else {
			if (window.lockIntervals[sectionId]) {
				clearInterval(window.lockIntervals[sectionId]);
				delete window.lockIntervals[sectionId];
			}
			if (timerEl) timerEl.remove();
			if (msgEl) msgEl.textContent = "Terminez " + prereqName + " pour débloquer ce module !";
		}

	} else {
		if (overlay) {
			overlay.remove();
			if (window.lockIntervals[sectionId]) {
				clearInterval(window.lockIntervals[sectionId]);
				delete window.lockIntervals[sectionId];
			}
		}
	}
};

const updateModuleLocks = () => {
	const lock2 = isModule2Locked();
	if (module2Start) {
		module2Start.disabled = lock2.locked;
		module2Start.textContent = lock2.locked ? "Module Verrouillé" : "Commencer le Module 2";
	}
	if (nextModuleButton) {
		nextModuleButton.disabled = lock2.locked;
	}

	const lock3 = isModule3Locked();
	if (module3Start) {
		module3Start.disabled = lock3.locked;
		module3Start.textContent = lock3.locked ? "Module Verrouillé" : "Commencer le Module 3";
	}
	if (nextModule3Button) {
		nextModule3Button.disabled = lock3.locked;
	}

	const lock4 = isModule4Locked();
	if (module4Start) {
		module4Start.disabled = lock4.locked;
		module4Start.textContent = lock4.locked ? "Module Verrouillé" : "Commencer le Module 4";
	}
	if (nextModule4Button) {
		nextModule4Button.disabled = lock4.locked;
	}

	const lock5 = isModule5Locked();
	if (module5Start) {
		module5Start.disabled = lock5.locked;
		module5Start.textContent = lock5.locked ? "Module Verrouillé" : "Commencer le Module 5";
	}
	if (nextModule5Button) {
		nextModule5Button.disabled = lock5.locked;
	}

	// Update Sidebar Locks
	const updateSidebarLink = (id, locked) => {
		const link = document.querySelector(`.sidebar__link[href="#${id}"]`);
		if (!link) return;
		
		link.classList.toggle('is-locked', locked);
		const existingLock = link.querySelector(".sidebar__lock");
		
		if (locked) {
			if (!existingLock) {
				const lockIcon = document.createElement("span");
				lockIcon.className = "sidebar__lock";
				lockIcon.textContent = "ðŸ”’";
				lockIcon.style.float = "right";
				link.appendChild(lockIcon);
			}
		} else {
			if (existingLock) {
				existingLock.remove();
			}
		}
	};

	updateSidebarLink('module-2', lock2.locked);
	updateSidebarLink('module-3', lock3.locked);
	updateSidebarLink('module-4', lock4.locked);
	updateSidebarLink('module-5', lock5.locked);
};

const guardQuizCompletion = (currentSectionId) => {
	const status = getQuizStatus();
	const quiz = document.querySelector(`#${currentSectionId} .quiz`);
	if (!quiz) {
		return true;
	}
	const quizId = quiz.getAttribute("id") || quiz.querySelector("h3")?.id || currentSectionId;
	const passed = status[quizId];
	if (!passed) {
		const info = quiz.querySelector(".quiz__status");
		if (info) {
			info.textContent = "Attention : Quiz non validé. Vous validez le module provisoirement.";
			info.classList.remove("is-error", "is-success");
			info.classList.add("is-warning");
		}
		// Allow proceeding even if failed (User Request)
		return true;
	}
	return true;
};

const handleNavigation = (event) => {
	const targetLink = event.target.closest(".sidebar__link");
	if (!targetLink) {
		return;
	}

	const sectionId = targetLink.getAttribute("href")?.replace("#", "");
	if (!sectionId) {
		return;
	}

	if (sectionId === "module-2" && isModule2Locked().locked) {
		// Allow navigation but show overlay
	}
	if (sectionId === "module-3" && isModule3Locked().locked) {
	}
	if (sectionId === "module-4" && isModule4Locked().locked) {
	}
	if (sectionId === "module-5" && isModule5Locked().locked) {
	}

	event.preventDefault();
	showSection(sectionId);
	toggleMenu(false);
};

sidebar.addEventListener("click", handleNavigation);

const quizAnswerMap = {
	"quiz-title": [1, 2, 1, 1],
	"quiz-html-title": [1, 1, 1, 2, 1, 0, 2, 0],
	"quiz-css-title": [1, 0, 1, 0, 1, 1, 0, 1, 2, 1],
	"quiz-js-title": [2, 1, 2, 1, 2, 1, 2, 3],
	"quiz-module-2-final": [2, 1, 3, 1, 3, 3, 3],
	"quiz-module-5-final": [1, 2, 3, 2, 1, 0, 1, 2],
};

const initQuiz = (quiz) => {
	const legend = quiz.querySelector("h3");
	const quizId = legend?.id || quiz.getAttribute("id") || `quiz-${Math.random().toString(36).slice(2)}`;
	if (!legend?.id) {
		quiz.setAttribute("id", quizId);
	}

	const status = document.createElement("p");
	status.className = "quiz__status";
	quiz.appendChild(status);

	const button = document.createElement("button");
	button.type = "button";
	button.className = "cta";
	button.textContent = "Valider les réponses";
	quiz.appendChild(button);

	button.addEventListener("click", () => {
		const questions = Array.from(quiz.querySelectorAll(".quiz__item"));
		
		// Mode: Recommencer (Reset)
		if (button.textContent === "Recommencer") {
			questions.forEach(fieldset => {
				const options = Array.from(fieldset.querySelectorAll("input[type='radio']"));
				options.forEach(opt => {
					opt.checked = false;
					opt.disabled = false;
					opt.parentElement.classList.remove('correct-answer', 'wrong-answer');
				});
				const explanation = fieldset.querySelector(".quiz__explanation");
				if (explanation) explanation.classList.remove("is-visible", "is-correct", "is-error");
			});
			status.textContent = "";
			status.className = "quiz__status";
			button.textContent = "Valider les réponses";
			return;
		}

		// Validation preliminaire: Toutes les questions doivent avoir une réponse
		const allAnswered = questions.every(fieldset => fieldset.querySelector("input:checked"));
		if (!allAnswered) {
			status.className = "quiz__status is-error";
			status.textContent = "⚠️ Veuillez répondre à toutes les questions avant de valider.";
			return;
		}

		const correctIndexes = quizAnswerMap[quizId] || [];
		let userScore = 0;

		questions.forEach((fieldset, index) => {
			const options = Array.from(fieldset.querySelectorAll("input[type=\"radio\"]"));
			const selectedIndex = options.findIndex((input) => input.checked);
			const correctIndex = correctIndexes[index];
			const isCorrect = selectedIndex === correctIndex;
			const explanation = fieldset.querySelector(".quiz__explanation");

			// Disable inputs to prevent changes (Anti-triche)
			options.forEach(opt => opt.disabled = true);

			// Reset visual states
			options.forEach(opt => opt.parentElement.classList.remove('correct-answer', 'wrong-answer'));

			// Logic: Confirm if True, Reject if False (Do not reveal correct answer if wrong)
			if (isCorrect) {
				if (options[correctIndex]) {
					options[correctIndex].parentElement.classList.add('correct-answer');
				}
				userScore++;
				
				// Show explanation only if correct (reward)
				if (explanation) {
					explanation.classList.add("is-visible", "is-correct");
					explanation.classList.remove("is-error");
				}
			} else {
				if (selectedIndex !== -1 && options[selectedIndex]) {
					options[selectedIndex].parentElement.classList.add('wrong-answer');
				}
				// Show explanation even if wrong so they can learn
				if (explanation) {
					explanation.classList.add("is-visible", "is-error");
					explanation.classList.remove("is-correct");
				}
			}
		});

		const total = questions.length;
		if (userScore === total) {
			status.className = "quiz__status is-success";
			status.textContent = `Bravo ! Score parfait : ${userScore}/${total}.`;
			button.textContent = "Terminé";
			button.disabled = true; // Final state
			
			// Mark as done only on full success
			const quizStatus = getQuizStatus();
			quizStatus[quizId] = true;
			setQuizStatus(quizStatus);
		} else {
			status.className = "quiz__status is-error";
			status.textContent = `Score : ${userScore}/${total}. Certaines réponses sont incorrectes. Ressayez !`;
			button.textContent = "Recommencer";
		}
	});
};

quizzes.forEach(initQuiz);

const handleActionButtons = (event) => {
	const button = event.target.closest("[data-target]");
	if (!button || button.disabled) {
		return;
	}

	const targetId = button.getAttribute("data-target");
	if (!targetId) {
		return;
	}

	// Safety: Only navigate if target is a known top-level section
	// This prevents conflicts with interactive elements like Hotspots
	const targetElement = document.getElementById(targetId);
	if (targetElement && !allSections.includes(targetElement)) {
		return;
	}

	if (targetId === "module-2" && isModule2Locked().locked) {
		// Allow navigation but show overlay
	}
	if (targetId === "module-3" && isModule3Locked().locked) {
	}
	if (targetId === "module-4" && isModule4Locked().locked) {
	}
	if (targetId === "module-5" && isModule5Locked().locked) {
	}

	showSection(targetId);
};

document.addEventListener("click", handleActionButtons);

completionButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const section = button.closest("section");
		if (!section) {
			return;
		}

		if (!guardQuizCompletion(section.id)) {
			return;
		}

		const completed = getStoredArray(STORAGE_KEYS.completed);
		let hasChanged = false;

		if (!completed.includes(section.id)) {
			completed.push(section.id);
			hasChanged = true;
		}

		// Special case for Module 2 Quiz: Mark the main module as complete too
		
		// Special case for Module 1 End
		if (section.id === 'module-1-lesson-4' && !completed.includes('module-1')) {
			completed.push('module-1');
			hasChanged = true;
		}

		if (section.id === 'module-2-quiz' && !completed.includes('module-2')) {
			completed.push('module-2');
			hasChanged = true;
		}

		// Special case for Module 3 Quiz
		if (section.id === 'module-3-quiz' && !completed.includes('module-3')) {
			completed.push('module-3');
			hasChanged = true;
		}

		// Special case for Module 4 Quiz
		if (section.id === 'module-4-quiz' && !completed.includes('module-4')) {
			completed.push('module-4');
			hasChanged = true;
		}

		// Special case for Module 5 Quiz
		if (section.id === 'module-5-quiz' && !completed.includes('module-5')) {
			completed.push('module-5');
			hasChanged = true;
		}

		if (hasChanged) {
			setStoredArray(STORAGE_KEYS.completed, completed);
			updateProgress();
			markSidebarStatus();
			updateModuleLocks();
			
			button.textContent = "Module Terminé âœ”ï¸";
			button.classList.add("is-success");
			setTimeout(() => {
				showToast("🎉 Félicitations ! Module validé avec succès !", "success");
				// Si bouton suivant existe et activé, on pourrait guider l'utilisateur
				const actions = button.parentElement;
				if (actions) {
					const nextBtn = actions.querySelector('[id^="nextModule"]');
					if (nextBtn && !nextBtn.disabled) {
						nextBtn.scrollIntoView({ behavior: 'smooth' });
					} else {
						showSection('courses');
					}
				}
			}, 500);
		}
	});
});

const restoreState = () => {
	// Always start at welcome if no specific hash is provided (ignore lastSection from localStorage for home page behavior)
	const hashSection = window.location.hash.replace("#", "");
	let targetSection = hashSection || "welcome"; 
	
	if (targetSection === "module-2" && isModule2Locked().locked) {
		// Allow viewing because overlay will handle it
		// targetSection = "courses"; 
	}
	if (targetSection) {
		showSection(targetSection, { updateHistory: true });
	}
	updateProgress();
	markSidebarStatus();
	updateModuleLocks();
};

restoreState();

// Interactive Diagram Logic
document.addEventListener('click', (e) => {
    // Open Hotspot
    const hotspot = e.target.closest('.hotspot');
    if (hotspot) {
        const container = hotspot.closest('.interactive-diagram');
        const infoId = hotspot.dataset.target;
        
        // Activate hotspot visual
        container.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
        hotspot.classList.add('active');
        
        // Show Overlay
        const overlay = container.querySelector('.diagram-overlay');
        overlay.classList.add('is-visible');
        
        // Populate and Show Popup
        const popup = container.querySelector('.diagram-popup');
        const sourceInfo = container.querySelector('#' + infoId);
        
        if (sourceInfo) {
            popup.querySelector('.popup-title').textContent = sourceInfo.dataset.title;
            popup.querySelector('.popup-body').innerHTML = sourceInfo.innerHTML;
            popup.classList.add('is-visible');
        }
    }
    
    // Close Popup
    if (e.target.closest('.diagram-overlay') || e.target.closest('.close-btn')) {
        const container = e.target.closest('.interactive-diagram');
        if (container) {
             container.querySelector('.diagram-popup').classList.remove('is-visible');
             container.querySelector('.diagram-overlay').classList.remove('is-visible');
             container.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
        }
    }
});

/* ========================================================================== */
/*                        TOAST NOTIFICATIONS                                  */
/* ========================================================================== */

const showToast = (message, type = "success", duration = 4000) => {
	const container = document.getElementById("toastContainer");
	if (!container) return;

	const icons = { success: "🎉", error: "❌", info: "💡" };

	const toast = document.createElement("div");
	toast.className = `toast is-${type}`;
	toast.innerHTML = `
		<span class="toast__icon">${icons[type] || "ℹ️"}</span>
		<span class="toast__text">${message}</span>
		<button class="toast__close" aria-label="Fermer">✕</button>
	`;

	const close = toast.querySelector(".toast__close");
	const dismiss = () => {
		toast.classList.add("is-hiding");
		setTimeout(() => toast.remove(), 300);
	};

	close.addEventListener("click", dismiss);
	container.appendChild(toast);
	setTimeout(dismiss, duration);
};

/* ========================================================================== */
/*                           DARK MODE TOGGLE                                  */
/* ========================================================================== */

const darkToggle = document.getElementById("darkToggle");
const DARK_KEY = "enspd_dark_mode";

const applyDark = (isDark) => {
	document.body.classList.toggle("dark-mode", isDark);
	if (darkToggle) darkToggle.textContent = isDark ? "☀️" : "🌙";
	localStorage.setItem(DARK_KEY, isDark ? "1" : "0");
};

// Restaurer préférence sauvegardée ou système
const savedDark = localStorage.getItem(DARK_KEY);
if (savedDark !== null) {
	applyDark(savedDark === "1");
} else {
	applyDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
}

if (darkToggle) {
	darkToggle.addEventListener("click", () => {
		applyDark(!document.body.classList.contains("dark-mode"));
	});
}
