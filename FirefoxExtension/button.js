console.log("Content script loaded for attendance page.");

function addButton() {
    const existingElement = document.querySelector('#home_view form > div');

    if (existingElement) {
        const button = document.createElement('button');
        button.style.backgroundColor = '#AF0C3E';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '6px';
        button.style.padding = '0 1rem';
        button.style.marginLeft = '1rem';
        button.style.height = '2.7rem';
        button.style.fontSize = '1.2rem';
        button.style.cursor = 'pointer';
        button.style.transition = 'background-color 0.2s';
        button.textContent = 'Go to Dashboard!';
        button.id = 'dump';
        button.style.zIndex = '9999';

        button.addEventListener('click', () => {
            console.log('Button clicked!');
            // Add your button's functionality here
            // For example, send a message to the background script:
            // chrome.runtime.sendMessage({ action: "buttonClicked" });
        });

        existingElement.appendChild(button);
        console.log("Button added to the page.");
    } else {
        console.warn("Could not find a suitable element to attach the button.");
    }
}

// Ensure the DOM is fully loaded before trying to add the button
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButton);
} else {
    addButton();
}