document.addEventListener('DOMContentLoaded', function() {
    const avatarDropdown = document.querySelector('.avatar-dropdown');
    const avatarDropdownContent = document.getElementById('avatarDropdownContent');
    const editBillBtn = document.getElementById('editBillBtn');
    const itemsList = document.getElementById('itemsList');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const results = document.getElementById('results');
    const defaultUI = document.getElementById('defaultUI');
    const calculateSection = document.getElementById('calculateSection');
    const itemTemplate = document.getElementById('itemTemplate');
    const tipPercentage = document.getElementById('tipPercentage');
    const mainAvatar = document.getElementById('mainAvatar');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');
    let selectedAvatar = null;

    // Ensure all required elements exist
    if (!avatarDropdown || !avatarDropdownContent || !editBillBtn || !itemsList || 
        !calculateBtn || !results || !defaultUI || !calculateSection || !itemTemplate) {
        console.error('Required elements not found');
        return;
    }

    // Initialize simonLines if not already defined
    if (typeof window.simonLines === 'undefined') {
        window.simonLines = [
            "Why are you gay?",
            "You are gay.",
            "Who says I'm gay?",
            "You are a transgender.",
            "You are a man and you are gay."
        ];
    }

    // Add new item functionality
    function addNewItem() {
        const newItem = itemTemplate.content.cloneNode(true);
        const addButton = newItem.querySelector('.add-item-btn');
        addButton.addEventListener('click', addNewItem);
        itemsList.appendChild(newItem);
    }

    // Avatar dropdown toggle
    avatarDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarDropdownContent.classList.toggle('show');
    });

    // Avatar selection
    avatarDropdownContent.querySelectorAll('.user-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Avatar clicked:', this.dataset.avatarSrc); // Debug log
            
            const avatarSrc = this.dataset.avatarSrc;
            if (avatarSrc) {
                console.log('Updating avatar to:', avatarSrc); // Debug log
                mainAvatar.src = avatarSrc;
                
                // Remove selected class from all options
                avatarDropdownContent.querySelectorAll('.user-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Store the selection in localStorage
                localStorage.setItem('selectedAvatar', this.dataset.avatar);
                
                // Close the dropdown
                avatarDropdownContent.classList.remove('show');
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!avatarDropdown.contains(event.target)) {
            avatarDropdownContent.classList.remove('show');
        }
    });

    // Edit bill button functionality
    editBillBtn.addEventListener('click', function() {
        defaultUI.style.display = 'none';
        itemsList.style.display = 'block';
        calculateSection.style.display = 'block';
        addNewItem();
    });

    // Handle user selection for items
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('select-users-btn') || 
            event.target.closest('.select-users-btn')) {
            const itemRow = event.target.closest('.item-row');
            const selectedUsersDiv = itemRow.querySelector('.selected-users');
            
            // Create user selection modal
            const modal = document.createElement('div');
            modal.className = 'user-selection-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>בחר משתמשים</h3>
                    <div class="user-list">
                        ${Array.from(avatarDropdownContent.querySelectorAll('.user-option'))
                            .map(option => `
                                <div class="user-option" data-user-id="${option.dataset.userId}">
                                    ${option.innerHTML}
                                </div>
                            `).join('')}
                    </div>
                    <div class="modal-buttons">
                        <button class="btn btn-primary save-users">שמור</button>
                        <button class="btn btn-outline-secondary close-modal">ביטול</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle user selection in modal
            const userOptions = modal.querySelectorAll('.user-option');
            const selectedUserIds = new Set();

            // Pre-select already selected users
            const currentSelectedUsers = Array.from(selectedUsersDiv.querySelectorAll('.selected-user'))
                .map(user => user.dataset.userId);
            currentSelectedUsers.forEach(userId => {
                selectedUserIds.add(userId);
                const option = modal.querySelector(`[data-user-id="${userId}"]`);
                if (option) option.classList.add('selected');
            });

            userOptions.forEach(option => {
                option.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    const userId = this.dataset.userId;
                    if (this.classList.contains('selected')) {
                        selectedUserIds.add(userId);
                    } else {
                        selectedUserIds.delete(userId);
                    }
                });
            });

            // Save selected users
            modal.querySelector('.save-users').addEventListener('click', function() {
                selectedUsersDiv.innerHTML = '';
                selectedUserIds.forEach(userId => {
                    const userOption = avatarDropdownContent.querySelector(`[data-user-id="${userId}"]`);
                    const userClone = userOption.cloneNode(true);
                    userClone.classList.add('selected-user');
                    selectedUsersDiv.appendChild(userClone);
                });
                document.body.removeChild(modal);
            });

            // Close modal
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });

            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });

            // Prevent modal content clicks from closing the modal
            modal.querySelector('.modal-content').addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });

    // Calculate button click handler
    calculateBtn.addEventListener('click', function() {
        const calculationContainer = document.getElementById('calculationContainer');
        const simonImage = document.getElementById('simonImage');
        const speechBubble = document.getElementById('speechBubble');

        if (!calculationContainer || !simonImage || !speechBubble) {
            console.error('Required elements for calculation not found');
            return;
        }

        // Show calculation container
        calculationContainer.style.display = 'block';
        
        // Calculate and display results
        calculateAndDisplayResults();
        
        // Reset Simon and speech bubble
        simonImage.style.opacity = '0';
        speechBubble.style.opacity = '0';
        speechBubble.innerHTML = '';
        
        // Force a reflow to ensure transitions work
        void simonImage.offsetWidth;
        void speechBubble.offsetWidth;
        
        // Show Simon after 5 seconds
        setTimeout(() => {
            console.log('Showing Simon...');
            simonImage.style.opacity = '1';
            
            // Show speech bubble with random text after 3 more seconds
            setTimeout(() => {
                console.log('Showing speech bubble...');
                if (window.simonLines && window.simonLines.length > 0) {
                    const randomLine = window.simonLines[Math.floor(Math.random() * window.simonLines.length)];
                    console.log('Random line:', randomLine);
                    
                    // Create new element for typing animation
                    const textElement = document.createElement('div');
                    textElement.className = 'typing-animation';
                    
                    // Create text node to ensure proper text handling
                    const textNode = document.createTextNode(randomLine);
                    textElement.appendChild(textNode);
                    
                    // Force LTR and left alignment
                    textElement.style.direction = 'ltr';
                    textElement.style.textAlign = 'left';
                    
                    // Add to speech bubble and show
                    speechBubble.innerHTML = '';
                    speechBubble.appendChild(textElement);
                    
                    // Force a reflow before showing
                    void speechBubble.offsetWidth;
                    speechBubble.style.opacity = '1';
                    
                    // After typing animation completes
                    setTimeout(() => {
                        console.log('Animation complete, setting final styles...');
                        // Keep only the blinking cursor animation
                        textElement.style.animation = 'blink-caret .75s step-end infinite';
                        textElement.style.width = '100%';
                    }, 3000);
                }
            }, 3000);
        }, 5000);
    });

    // Update date and time display
    function updateDateTime() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('currentDateTime').textContent = now.toLocaleDateString('he-IL', options);
    }
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // Save event functionality
    const saveEventBtn = document.getElementById('saveEventBtn');
    const savedEventsList = document.getElementById('savedEventsList');
    const eventSummaryModal = new bootstrap.Modal(document.getElementById('eventSummaryModal'));
    const deleteConfirmationModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    let events = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    let eventToDelete = null;

    function saveEvent() {
        const eventPlace = document.getElementById('eventPlace').value;
        const items = Array.from(itemsList.querySelectorAll('.item-row')).map(row => {
            const name = row.querySelector('.item-name').value;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const selectedUsers = Array.from(row.querySelectorAll('.selected-user'))
                .map(user => user.dataset.userId);
            return { name, price, selectedUsers };
        });

        const tipPercent = parseFloat(tipPercentage.value) || 0;
        const totalBill = items.reduce((sum, item) => sum + item.price, 0);
        const tipAmount = totalBill * (tipPercent / 100);
        const totalWithTip = totalBill + tipAmount;

        const event = {
            id: Date.now(),
            place: eventPlace,
            date: new Date().toISOString(),
            items,
            tipPercent,
            totalBill,
            tipAmount,
            totalWithTip,
            personTotals: calculatePersonTotals(items, totalBill, tipAmount)
        };

        events.unshift(event);
        localStorage.setItem('savedEvents', JSON.stringify(events));
        displaySavedEvents();
    }

    function calculatePersonTotals(items, totalBill, tipAmount) {
        const personTotals = {};
        items.forEach(item => {
            const splitAmount = item.price / item.selectedUsers.length;
            item.selectedUsers.forEach(userId => {
                if (!personTotals[userId]) {
                    personTotals[userId] = 0;
                }
                personTotals[userId] += splitAmount;
            });
        });

        Object.keys(personTotals).forEach(userId => {
            personTotals[userId] += (personTotals[userId] / totalBill * tipAmount);
        });

        return personTotals;
    }

    function displaySavedEvents() {
        savedEventsList.innerHTML = '';
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'saved-event';
            eventElement.innerHTML = `
                <div class="saved-event-info">
                    <div class="event-place">${event.place}</div>
                    <div class="event-date">${new Date(event.date).toLocaleDateString('he-IL')}</div>
                    <div class="event-total">סה"כ: ${event.totalWithTip.toFixed(2)} ₪</div>
                </div>
                <div class="saved-event-actions">
                    <button class="delete-event-btn" data-event-id="${event.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            eventElement.querySelector('.saved-event-info').addEventListener('click', () => showEventSummary(event));
            eventElement.querySelector('.delete-event-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                eventToDelete = event.id;
                deleteConfirmationModal.show();
            });

            savedEventsList.appendChild(eventElement);
        });
    }

    function showEventSummary(event) {
        const content = document.getElementById('eventSummaryContent');
        content.innerHTML = `
            <div class="event-summary">
                <div class="summary-header">
                    <h4>${event.place}</h4>
                    <div class="event-date">${new Date(event.date).toLocaleDateString('he-IL')}</div>
                </div>
                <div class="summary-totals">
                    <div>סך הכל: ${event.totalBill.toFixed(2)} ₪</div>
                    <div>טיפ (${event.tipPercent}%): ${event.tipAmount.toFixed(2)} ₪</div>
                    <div class="final-total">סה"כ לתשלום: ${event.totalWithTip.toFixed(2)} ₪</div>
                </div>
                <div class="summary-items">
                    <h5>פריטים:</h5>
                    ${event.items.map(item => `
                        <div class="summary-item">
                            <span>${item.name}</span>
                            <span>${item.price.toFixed(2)} ₪</span>
                        </div>
                    `).join('')}
                </div>
                <div class="summary-users">
                    <h5>חלוקה לפי משתמשים:</h5>
                    ${Object.entries(event.personTotals).map(([userId, amount]) => {
                        const userOption = avatarDropdownContent.querySelector(`[data-user-id="${userId}"]`);
                        return `
                            <div class="summary-user">
                                ${userOption.innerHTML}
                                <span>${amount.toFixed(2)} ₪</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        eventSummaryModal.show();
    }

    saveEventBtn.addEventListener('click', saveEvent);
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (eventToDelete) {
            events = events.filter(event => event.id !== eventToDelete);
            localStorage.setItem('savedEvents', JSON.stringify(events));
            displaySavedEvents();
            deleteConfirmationModal.hide();
            eventToDelete = null;
        }
    });

    // Display saved events on page load
    displaySavedEvents();

    // Add item button functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-item-btn')) {
            const itemContainer = e.target.closest('.item-container');
            const newItemContainer = itemContainer.cloneNode(true);
            newItemContainer.querySelector('input').value = '';
            itemContainer.parentNode.insertBefore(newItemContainer, itemContainer.nextSibling);
        }
    });

    // Calculate totals with tip
    function calculateTotals() {
        let subtotal = 0;
        const items = document.querySelectorAll('.item-container');
        items.forEach(item => {
            const price = parseFloat(item.querySelector('input').value) || 0;
            subtotal += price;
        });

        const tipPercentage = parseFloat(document.getElementById('tipPercentage').value) || 0;
        const tipAmount = (subtotal * tipPercentage) / 100;
        const total = subtotal + tipAmount;

        document.getElementById('subtotal').textContent = `₪${subtotal.toFixed(2)}`;
        document.getElementById('tipAmount').textContent = `₪${tipAmount.toFixed(2)}`;
        document.getElementById('total').textContent = `₪${total.toFixed(2)}`;

        return total;
    }

    // Update totals when inputs change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-price') || e.target.id === 'tipPercentage') {
            calculateTotals();
        }
    });

    // Format price input with ₪ symbol
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('item-price')) {
            const value = e.target.value.replace(/[^\d.]/g, '');
            e.target.value = value;
        }
    });

    // Initialize totals on page load
    calculateTotals();

    // Load saved avatar on page load
    const savedAvatar = localStorage.getItem('selectedAvatar');
    if (savedAvatar) {
        const savedOption = avatarDropdownContent.querySelector(`[data-avatar="${savedAvatar}"]`);
        if (savedOption) {
            mainAvatar.src = savedOption.dataset.avatarSrc;
            savedOption.classList.add('selected');
        }
    }

    function calculateAndDisplayResults() {
        const totalAmountElement = document.getElementById('totalAmount');
        const tipAmountElement = document.getElementById('tipAmount');
        const finalTotalElement = document.getElementById('finalTotal');
        const userResultsElement = document.getElementById('userResults');

        if (!totalAmountElement || !tipAmountElement || !finalTotalElement || !userResultsElement) {
            console.error('Required result elements not found');
            return;
        }

        const items = Array.from(itemsList.querySelectorAll('.item-row')).map(row => {
            const name = row.querySelector('.item-name')?.value || '';
            const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
            const selectedUsers = Array.from(row.querySelectorAll('.selected-user'))
                .map(user => user.dataset.userId)
                .filter(id => id); // Filter out undefined/null values
            
            return { name, price, selectedUsers };
        });

        // Calculate totals
        let totalBill = 0;
        const personTotals = {};

        items.forEach(item => {
            if (item.selectedUsers.length > 0) {
                totalBill += item.price;
                const splitAmount = item.price / item.selectedUsers.length;
                item.selectedUsers.forEach(userId => {
                    personTotals[userId] = (personTotals[userId] || 0) + splitAmount;
                });
            }
        });

        const tipPercent = parseFloat(tipPercentage.value) || 0;
        const tipAmount = totalBill * (tipPercent / 100);
        const totalWithTip = totalBill + tipAmount;

        // Update display
        totalAmountElement.textContent = totalBill.toFixed(2);
        tipAmountElement.textContent = tipAmount.toFixed(2);
        finalTotalElement.textContent = totalWithTip.toFixed(2);

        // Update per-person results
        userResultsElement.innerHTML = '';
        Object.entries(personTotals).forEach(([userId, amount]) => {
            const userOption = avatarDropdownContent.querySelector(`[data-user-id="${userId}"]`);
            if (userOption) {
                const userAmount = amount + (amount / totalBill * tipAmount);
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        ${userOption.innerHTML}
                        <span class="amount">${userAmount.toFixed(2)} ₪</span>
                    </div>
                `;
                userResultsElement.appendChild(resultItem);
            }
        });
    }

    // Reset button functionality
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }
}); 