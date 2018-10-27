// To indicate whether the tab has been checked after the tab is loaded
var isChecked = false;

// Initiate once the tab is updated
chrome.tabs.onUpdated.addListener(function (tab, changeInfo) {

    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var currentUrl = tabs[0].url;

        // Initiate the link checking when the tab is still loading if the tab is never checked before
        if (changeInfo.status == "loading" && isChecked == false && !currentUrl.includes("chrome://")
            && !currentUrl.includes("about:")) {
            checkLinks(currentUrl);
            isChecked = true;
        }
    });
});

// To check whether the url is on PhishTank blacklist 
function checkLinks(currentUrl) {
    
    // To exhange data with a server behind the scene
    var xhrobj = new XMLHttpRequest();

    var formData = new FormData();
    formData.append("url", currentUrl);
    formData.append("format", 'json');
    // App key can be obtained in PhishTank website
    formData.append("app_key", 'c812781dc0c047c462acf8a161f4f29362261da831a5a74678c017982a81ce90');

    // Initiate if the request receives an answer
    xhrobj.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myresponsejson1 = JSON.parse(this.responseText);

            // Result on whether the website is blacklisted
            inDatabase = myresponsejson1.results.in_database;

            if (inDatabase == true) {
                // Ask if want to continue using the phishing webiste
                if (!confirm("This is a phising website. Are you sure want to proceed?")) {
                    chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
                        // Redirect to a new tab page
                        chrome.tabs.update(tab.id, { url: "chrome://newtab" });
                    });
                }
            }
        }
    }
    // Specify the type of request and url
    xhrobj.open("POST", 'http://checkurl.phishtank.com/checkurl/');
    // Send the request to PhishTank server
    xhrobj.send(formData);
}