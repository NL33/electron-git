const { macFocus } = require('./navigator-jxa');
/***This function takes the data and loads it into the view for the user***** */

module.exports = function (data) {
    let $container = document.getElementById('container');
    if ($container) $container.remove();
    $container = document.createElement('div');
    $container.id = 'container';
    document.body.appendChild($container);

    for (let i = 0; i < data.length; i++) {  //loop through each app
        const { appName, appIcon, windows, unixId } = data[i];
        const $card = document.createElement("div");
        $card.id = "card";

        const $appIcon = document.createElement("img");
        $appIcon.src = appIcon;
        $appIcon.width = 50;
        $appIcon.onclick = () => macFocus(unixId).catch(e => alert(e));
        $card.appendChild($appIcon);

        const $appName = document.createElement("h2");
        $appName.innerText = appName;
        $appName.onclick = () => macFocus(unixId).catch(e => alert(e));
        $card.appendChild($appName);

        const $windows = document.createElement("ul");

        for (let i = 0; i < windows.length; i++) {  //within each app, loop through each window
            const $window = document.createElement("li");

            const $windowIcon = document.createElement("span");
            $windowIcon.className = "material-icons";
            $windowIcon.innerText = "web";
            $windowIcon.onclick = () => macFocus(unixId, windows[i].position).catch(e => alert(e));
            $window.appendChild($windowIcon);

            const $windowName = document.createElement("h5");
            $windowName.innerHTML = windows[i].name;
            $windowName.onclick = () => { macFocus(unixId, windows[i].position).catch(e => alert(e)); location.reload(); }
            $window.appendChild($windowName);

            if (!windows[i].tabs) {
                $windows.appendChild($window);
                continue;
            }

            const $tabs = document.createElement("div");

            for (let u = 0; u < windows[i].tabs.length; u++) { //loop through each chrome tab
                const $tab = document.createElement("span");
                $tab.onclick = () => macFocus(unixId, windows[i].position, windows[i].tabs[u].position).catch(e => alert(e));

                const $tabIcon = document.createElement("img");
                $tabIcon.src = windows[i].tabs[u].favicon.length ? windows[i].tabs[u].favicon : `http://${windows[i].tabs[u].url.split('/')[2]}/favicon.ico`;
                $tabIcon.width = 24;
                $tab.appendChild($tabIcon);

                const $tabTitle = document.createElement("small");
                $tabTitle.innerText = windows[i].tabs[u].name;
                $tab.appendChild($tabTitle);

                $tabs.appendChild($tab);
            }
            $window.appendChild($tabs);

            $windows.appendChild($window);
        }

        $card.appendChild($windows);
        $container.appendChild($card);
    }
}

