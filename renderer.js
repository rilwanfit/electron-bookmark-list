// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const {shell} = require('electron');

const parser = new DOMParser();

const linksSection = document.getElementById('links');
const errorMessage = document.getElementById('error-message');
const newLinkForm = document.getElementById('new-link-form');
const newLinkUrl = document.getElementById('new-link-url');
const newLinkSubmit = document.getElementById('new-link-submit');
const clearStorageButton = document.getElementById('clear-storage');

clearStorageButton.addEventListener('click', () => {
    localStorage.clear();
    linksSection.innerHTML = '';
});

// enable submit button
newLinkUrl.addEventListener('keyup', () => {
    newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});

// Clear url field
const clearForm = () => {
    newLinkUrl.value = null;
};

newLinkForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = newLinkUrl.value;

    fetch(url)
        .then(response => response.text())
        .then(parseResponse)
        .then(findTitle)
        .then(title => storeLink(title, url))
        .then(clearForm)
        .then(renderLinks)
        .catch(error => handleError(error, url));
});

const handleError = (error, url) => {
    errorMessage.innerHTML = `There was an issue adding "${url}": ${error.message} `.trim();

    // Clears the error message after 5 seconds
    setTimeout(() => errorMessage.innerText = null, 5000);
};

const validateResponse = (response) => {
    if (response.ok) { return response; }
    throw new Error(`Status code of ${response.status} ${response.statusText}`);
};

// Takes the string of HTML from the URL and parses it into a DOM tree.
const parseResponse = (text) => {
    return parser.parseFromString(text, 'text/html');
}

// Traverses the DOM tree to find the <title> node.
const findTitle = (nodes) => {
    return nodes.querySelector('title').innerText;
}

// Persist links in local storage
const storeLink = (title, url) => {
    localStorage.setItem(url, JSON.stringify({ title: title, url: url }));
};

// Getting links from local storage
const getLinks = () => {
    return Object
        .keys(localStorage)
        .map(key => JSON.parse(localStorage.getItem(key)));
};

const convertToElement = (link) => {
    return `
<div class="link"> <h3>${link.title}</h3>
<p>
<a href="${link.url}">${link.url}</a> </p>
</div> `;
};

const renderLinks = () => {
    const linkElements = getLinks().map(convertToElement).join('');
    linksSection.innerHTML = linkElements;
};

// Open link in user's default browser
linksSection.addEventListener('click', (event) => {
    if (event.target.href) {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }
});

// When the page initially loads
renderLinks();