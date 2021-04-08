window.addEventListener('DOMContentLoaded', () => { //define an event listener that tells you when the web page has loaded 
    const replaceText = (selector, text) => { //define a utility function used to set the text of the placeholders in index.html
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) { //loop through componsents whose version you want to display
        replaceText(`${type}-version`, process.versions[type]) //call replace text to look up the version placeholders in index.html and set their text value to the values from process.versions
    }
})
