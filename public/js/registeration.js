document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // ✅ Cache DOM elements for better performance
    const elements = {
        firstName: document.getElementById('firstName'),
        middleName: document.getElementById('middleName'),
        lastName: document.getElementById('lastName'),
        gender: document.getElementById('gender'),
        phone: document.getElementById('phone'),
        city: document.getElementById('city'),
        state: document.getElementById('state'),
        age: document.getElementById('age'),
        dob: document.getElementById('dob'),
        tenthPercentage: document.getElementById('tenthPercentage'),
        board: document.getElementById('board'),
        physicsMarks: document.getElementById('physicsMarks'),
        chemistryMarks: document.getElementById('chemistryMarks'),
        mathsMarks: document.getElementById('mathsMarks'),
        biologyMarks: document.getElementById('biologyMarks'),
        interest: document.getElementById('interest'),
        accuracyConsent: document.getElementById('accuracyConsent'),
        contactConsent: document.getElementById('contactConsent')
    };

    // ✅ Debounce function to limit validation frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ✅ Validation functions
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
    }

    function validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''));
    }

    function validateAge(age) {
        const ageNum = parseInt(age);
        return ageNum >= 15 && ageNum <= 25;
    }

    function validatePercentage(percentage) {
        const percentNum = parseFloat(percentage);
        return percentNum >= 0 && percentNum <= 100;
    }

    function validateSubjectMarks(marks) {
        const marksNum = parseInt(marks);
        return marksNum >= 0 && marksNum <= 100;
    }

    function validateCity(city) {
        return city.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(city.trim());
    }

    function validateState(state) {
        return state.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(state.trim());
    }

    // ✅ Date of birth validation
    function validateDateOfBirth(dob) {
        const birthDate = new Date(dob);
        if (isNaN(birthDate)) return false;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 15 && age <= 25;
    }

    function showError(fieldId, message) {
        const field = elements[fieldId];
        const errorElement = document.getElementById(fieldId + 'Error');

        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(fieldId) {
        const field = elements[fieldId];
        const errorElement = document.getElementById(fieldId + 'Error');

        field.classList.remove('error');
        errorElement.style.display = 'none';
    }

    function validateField(fieldId, validator, errorMessage) {
        const field = elements[fieldId];
        const value = field.value.trim();

        if (!value || !validator(value)) {
            showError(fieldId, errorMessage);
            return false;
        } else {
            hideError(fieldId);
            return true;
        }
    }

    // ✅ Optimized validation with debouncing (300ms delay)
    const debouncedValidate = debounce(function(fieldId) {
        const validatorMap = {
            firstName: validateName,
            lastName: validateName,
            phone: validatePhone,
            age: validateAge,
            dob: validateDateOfBirth,
            tenthPercentage: validatePercentage,
            physicsMarks: validateSubjectMarks,
            chemistryMarks: validateSubjectMarks,
            mathsMarks: validateSubjectMarks,
            biologyMarks: validateSubjectMarks,
            city: validateCity,
            state: validateState
        };

        const messageMap = {
            firstName: 'Please enter a valid first name',
            lastName: 'Please enter a valid last name',
            phone: 'Please enter a valid 10-digit phone number starting with 6-9',
            age: 'Age must be between 15 and 25',
            dob: 'Please select a valid date of birth (age 15-25)',
            tenthPercentage: 'Please enter a valid percentage (0-100)',
            physicsMarks: 'Please enter valid Physics marks (0-100)',
            chemistryMarks: 'Please enter valid Chemistry marks (0-100)',
            mathsMarks: 'Please enter valid Maths marks (0-100)',
            biologyMarks: 'Please enter valid Biology marks (0-100)',
            city: 'Please enter a valid city name',
            state: 'Please enter a valid state name'
        };

        if (validatorMap[fieldId] && messageMap[fieldId]) {
            validateField(fieldId, validatorMap[fieldId], messageMap[fieldId]);
        }
    }, 300);

    // ✅ Optimized event listeners with debouncing
    [
        'firstName', 'lastName', 'phone', 'age', 'dob',
        'tenthPercentage', 'physicsMarks', 'chemistryMarks',
        'mathsMarks', 'biologyMarks', 'city', 'state'
    ].forEach(id => {
        elements[id].addEventListener('input', function () {
            debouncedValidate(id);
        });
    });

    // ✅ Auto-fill age from DOB (immediate, no debounce needed)
    elements.dob.addEventListener('change', function () {
        if (this.value) {
            const birthDate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            elements.age.value = age;
            debouncedValidate('age'); // Validate age after auto-fill
        }
    });

    // ✅ Form submission
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        isValid = isValid && validateField('firstName', validateName, 'Please enter a valid first name');
        isValid = isValid && validateField('lastName', validateName, 'Please enter a valid last name');
        isValid = isValid && validateField('phone', validatePhone, 'Please enter a valid phone number');
        isValid = isValid && validateField('age', validateAge, 'Age must be between 15 and 25');
        isValid = isValid && validateField('dob', validateDateOfBirth, 'Invalid date of birth');
        isValid = isValid && validateField('tenthPercentage', validatePercentage, 'Please enter valid percentage');
        isValid = isValid && validateField('physicsMarks', validateSubjectMarks, 'Invalid Physics marks');
        isValid = isValid && validateField('chemistryMarks', validateSubjectMarks, 'Invalid Chemistry marks');
        isValid = isValid && validateField('mathsMarks', validateSubjectMarks, 'Invalid Maths marks');
        isValid = isValid && validateField('biologyMarks', validateSubjectMarks, 'Invalid Biology marks');
        isValid = isValid && validateField('city', validateCity, 'Invalid city');
        isValid = isValid && validateField('state', validateState, 'Invalid state');

        const board = elements.board;
        if (!board.value) {
            showError('board', 'Please select your board');
            isValid = false;
        } else {
            hideError('board');
        }

        const interest = elements.interest;
        if (interest.value.trim().length < 3) {
            showError('interest', 'Please enter your area of interest (min 3 characters)');
            isValid = false;
        } else {
            hideError('interest');
        }

        const gender = elements.gender;
        if (!gender.value) {
            showError('gender', 'Please select your gender');
            isValid = false;
        } else {
            hideError('gender');
        }

        const accuracyConsent = elements.accuracyConsent;
        if (!accuracyConsent.checked) {
            showError('accuracyConsent', 'Please confirm the accuracy of your information');
            isValid = false;
        } else {
            hideError('accuracyConsent');
        }

        const contactConsent = elements.contactConsent;
        if (!contactConsent.checked) {
            showError('contactConsent', 'Please provide consent to be contacted');
            isValid = false;
        } else {
            hideError('contactConsent');
        }

        // ✅ If form is valid, send data to backend
        if (isValid) {
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Processing...';

            const formData = {
                firstName: elements.firstName.value.trim(),
                middleName: elements.middleName.value.trim(),
                lastName: elements.lastName.value.trim(),
                phone: elements.phone.value.trim(),
                age: elements.age.value.trim(),
                dob: elements.dob.value.trim(),
                tenthPercentage: elements.tenthPercentage.value.trim(),
                physicsMarks: elements.physicsMarks.value.trim(),
                chemistryMarks: elements.chemistryMarks.value.trim(),
                mathsMarks: elements.mathsMarks.value.trim(),
                biologyMarks: elements.biologyMarks.value.trim(),
                city: elements.city.value.trim(),
                state: elements.state.value.trim(),
                board: elements.board.value.trim(),
                interest: elements.interest.value.trim(),
                gender: elements.gender.value.trim(),
                accuracyConsent: elements.accuracyConsent.checked,
                contactConsent: elements.contactConsent.checked
            };

            try {
                const response = await fetch('/registeration', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    submitBtn.classList.remove('loading');
                    submitBtn.textContent = 'Register Now';
                    successMessage.style.display = 'block';
                    form.reset();
                    successMessage.scrollIntoView({ behavior: 'smooth' });

                    // ✅ Redirect after success
                    window.location.href = '/dashboard';
                } else {
                    alert('❌ Registration failed: ' + data.message);
                    submitBtn.classList.remove('loading');
                    submitBtn.textContent = 'Register Now';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Could not connect to the server.');
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Register Now';
            }
        } else {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});
