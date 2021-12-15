/**Functions to navigate results based on keypresses. Note that tab happens automatically by giving divs a tabIndex */

var theSibling
var theParent
var nextWindow
var priorItem

module.exports.searchKeyDown = function (e){
    if ((e.key === "Enter") || (e.key === "Return")){
        e.preventDefault()
        var div = document.querySelectorAll('.appUpDetails')[0]
        nextAppFromSearchFunction(div)
    } else {
        if (document.querySelector('.hoverHighlight')){ 
            document.querySelector('.hoverHighlight').classList.remove('hoverHighlight')
        }
        var div = document.querySelectorAll('.appUpDetails')[0]
        nextAppFromSearchFunctionHover(div)
    }
    if (e.key === 'ArrowDown') {
       //arrowDownFunction(e)
       //console.log('arrow wowo oowo')
       //start here to add ability to hit down key to move out of name search
    }
}

function nextAppFromSearchFunction(target) { //target = next appOverview
   try {
    if (target.classList.contains('hideDiv')){
        var nextApp = target.parentElement.nextElementSibling.children[0]
        nextAppFromSearchFunction(nextApp)
    } else {
        if (target.classList.contains('justThereBCOfChild')){
            var firstChild = target.nextElementSibling.children[0]
            selectChildFromAppForSearch(firstChild, target)
        } else {
            focusApp(target)
            if (document.querySelector('.hoverHighlight')) {
                document.querySelector('.hoverHighlight').classList.remove('hoverHighlight')
            }
        }
    }
   } catch(e){
       console.log('error getting search app = ' + e)
   }
}
              

function selectChildFromAppForSearch(target, app){
    try {
        if (target.classList.contains('hideDiv')){
            var nextItem = target.nextElementSibling
            selectChildFromAppForSearch(nextItem, app)
        } else {
            if (target.classList.contains('tabNpOverview')){               
               focusChromeTab(target) 
                if (document.querySelector('.hoverHighlight')) {
                    document.querySelector('.hoverHighlight').classList.remove('hoverHighlight')
                }
            } else {
                focusWindow(target)
                if (document.querySelector('.hoverHighlight')) {
                    document.querySelector('.hoverHighlight').classList.remove('hoverHighlight')
                }
            }
        }
    } catch(e){
        console.log('error getting next app = ' + e)
        focusApp(app)
        if (document.querySelector('.hoverHighlight')) {
            document.querySelector('.hoverHighlight').classList.remove('hoverHighlight')
        }
    }

}
/***HIGHLIGHT TOP SEARCH RESULT*** */

function nextAppFromSearchFunctionHover(target) { //target = next appOverview
   try {
    if (target.classList.contains('hideDiv')){
        if (target.parentElement.nextElementSibling){
            var nextApp = target.parentElement.nextElementSibling.children[0]
            nextAppFromSearchFunctionHover(nextApp)
        }
    } else {
        if (target.classList.contains('justThereBCOfChild')){
            var firstChild = target.nextElementSibling.children[0]
            selectChildFromAppForSearchHover(firstChild, target)
        } else {
            target.classList.add('hoverHighlight')
        }
    }
   } catch(e){
          console.log('error highlighting app from search = ' + e)
   }
}

function selectChildFromAppForSearchHover(target, app){
    try {
    if (target.classList) {  
        if (target.classList.contains('hideDiv')){
            if (target.nextElementSibling) {
                var nextItem = target.nextElementSibling
                selectChildFromAppForSearchHover(nextItem, app)
            }
        } else {         
                target.classList.add('hoverHighlight')
        }
    }
    } catch(e){
        console.log('error highlighting window app from search = ' + e)
    }
}
/**END HIGHLIGHT*** */

module.exports.keyDownFunction = function (e) {
    if ((e.keyCode === 13) || (e.key === "Enter") || (e.key === "Return")) { //press return
        if (e.target.status === 'app') {
            focusApp(e)
        }
        if (e.target.status === 'window') {
            focusWindow(e)
        }
        if (e.target.status === 'chromeTab') {
            focusChromeTab(e)
        }
    }

    if ((e.key === "Backspace") || (e.keyCode === 8) || (e.key === "Delete")) { //press delete or backspace
        if (e.target.status === 'window') {
            e.preventDefault()
            var target = JSON.stringify(e.target)
            ipcRenderer.send('show-context-menu-window-name', target)
        }

        if (e.target.status === 'chromeTab') {
            e.preventDefault()
            var target = JSON.stringify(e.target)
            ipcRenderer.send('show-context-menu-chrome-tab', target)
        }
    } //end if backspace/delete

    if ((e.key === 'ArrowDown') || (e.key === 'ArrowRight')) {
        arrowDownFunction(e)
    }

    if ((e.key === 'ArrowUp') || (e.key === 'ArrowLeft')) {
        arrowUpFunction(e)
    }

}

/****ARROW DOWN FUNCTIONS*********************** */

function arrowDownFunction(e) {
    if ((e.target.status === 'app')){
        var childCount = e.target.nextElementSibling.childElementCount  //count of children in "nextItems" under app
        if (childCount > 0) {
            nextWindow = nextWindowFromAppFunction(e.target.nextElementSibling) //param = nextItems div
            if (nextWindow !== 'n/a') {
                nextWindow.focus()
            } 
        } else { //no matching windows in app, so move on to next app
            if (e.target.parentElement.nextElementSibling) {
                nextApp = nextAppFromAppFunction(e.target.parentElement.nextElementSibling)
                if (nextApp !== 'n/a') {
                    nextApp.focus()
                } else {
                    document.getElementById('nameSearch').focus() /***START HERE: SEEMS TO BE WORKING. 
            then: transfer to its own doc
            and handle arrow up
            */
                }
            } else {
                document.getElementById('nameSearch').focus()
            }
        }

    } else if ((e.target.status === 'window') || (e.target.status === 'chromeTab')) {
        nextWindowFromWindowFunction(e.target)
        if (theSibling !== 'n/a') {
            theSibling.focus()
        } else if (e.target.parentElement.parentElement.nextElementSibling) {
            nextAppFromWindowFunction(e.target, 'windowLevel')
            if (theParent !== 'n/a') {
                theParent.children[0].focus() //focus on appUpDetails level
            } else {
                document.getElementById('nameSearch').focus()
            }
        } else {
            document.getElementById('nameSearch').focus()
        }
    }
} //end arrowDownFunction

function nextWindowFromWindowFunction(target) { //for finding next window or tab, starting from a window or tab
    if (target.nextElementSibling) {
        if (target.nextElementSibling.classList.contains('hideDiv')) {
            nextWindowFromWindowFunction(target.nextElementSibling)
        } else {
            theSibling = target.nextElementSibling
        }
    } else {
        theSibling = 'n/a'
    }
}

function nextAppFromWindowFunction(target, startingPoint) {//for finding next app, starting from a window or tab
    if (startingPoint === 'windowLevel') {//start from window (first run through of function)
        var nextParent = target.parentElement.parentElement.nextElementSibling //nextParent at level of appOverview
    } else { //start from app level (after-first run through)
        var nextParent = target.nextElementSibling
    }
    if (nextParent) {
        if (nextParent.children[0].classList.contains('hideDiv')) {  //hideDiv is added at level of appUpDetails
            nextAppFromWindowFunction(nextParent, 'appLevel')
        } else {
            theParent = nextParent
        }
    } else {
        theParent = 'n/a'
    }
}

function nextWindowFromAppFunction(target) { //target = the next appOverview
    var children = target.children
    var matches = 'noMatches'
    for (var i = 0; i < children.length; i++) {
        if (!children[i].classList.contains('hideDiv')) {
            matches = 'yesMatches'
            return children[i]
        }
    }
    if (matches = 'noMatches') {
        return 'n/a'
    }
}

function nextAppFromAppFunction(target) { //target = next appOverview
    if (target.children[0]) {
        if (target.children[0].classList.contains('hideDiv')) {
            nextAppFromAppFunction(target.nextElementSibling)
        } else {
            return target.children[0]
        }
    } else {
        return 'n/a'
    }
}


/****ARROW UP FUNCTIONS ******/

function arrowUpFunction(e) {
    if (e.target.status === 'app') {
        let priorApp = e.target.parentElement.previousElementSibling   //"nextItems" under previous app
        if (priorApp) {
            priorItemsFromAppFunction(priorApp.children[0]) //param = prior app details
            if (priorItem !== 'n/a') {
                priorItem.focus()
            } else {
                document.getElementById('nameSearch').focus()
            }
        } else { //no matching prior app details, so go back to search
            document.getElementById('nameSearch').focus()
        }

    } else if ((e.target.status === 'window') || (e.target.status === 'chromeTab')) {
        priorItemsFromWindowFunction(e.target)
        priorItem.focus()
    }
} //end arrowUpFunction


function priorItemsFromAppFunction(priorDetails) {
    if (!priorDetails.classList.contains('hideDiv')) { //if the prior app details are not hidden
        var nextItems = priorDetails.nextElementSibling
        var length = nextItems.children.length
        var matches = 'noMatches'
        if (length > 0) {
            for (var i = 1; i <= nextItems.children.length; i++) {
                //why length - 1 ? because we are looking here at prior windows, meaning windows above in the list--so in that prior window list, you want to start with the last and go from there
                if (!nextItems.children[length - i].classList.contains('hideDiv')) {
                    matches = 'yesMatches'
                    priorItem = nextItems.children[length - i]  //RETURN EARLIER WINDOW
                    return 'done'
                }
            }
            if (matches = 'noMatches') {
                priorItem = priorDetails //RETURN EARLIER APP
                return 'done'
            }
        } else {
            priorItem = priorDetails //RETURN EARLIER APP
            return 'done'
        }
    } else { //earlier app doesn't match. go to app before that
        let nextPriorApp = priorDetails.parentElement.previousElementSibling
        if (nextPriorApp) {
            priorItemsFromAppFunction(nextPriorApp.children[0])
        } else {
            priorItem = 'n/a'
            return 'done'
        }
    }
}

function priorItemsFromWindowFunction(target) {
    if (target.previousElementSibling) {
        if (!target.previousElementSibling.classList.contains('hideDiv')) {
            priorItem = target.previousElementSibling
            return 'done'
        } else {
            priorItemsFromWindowFunction(target.previousElementSibling)
        }
    } else {
        priorItem = target.parentElement.previousElementSibling
        return 'done'
    }

}