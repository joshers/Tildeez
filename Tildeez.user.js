// ==UserScript==
// @name          Tildeez
// @namespace     https://github.com/joshers/Tildeez
// @version       1.1.1
// @description   Adds some extra functionality to http://tildes.net/
// @author        Joshers (https://github.com/joshers)
// @match         https://*.tildes.net/*
// @icon          https://www.google.com/s2/favicons?sz=64&domain=tildes.net
// @downloadURL   https://github.com/joshers/Tildeez/raw/main/Tildeez.user.js
// @updateURL     https://github.com/joshers/Tildeez/raw/main/Tildeez.user.js
// @license       GPL-3.0
// ==/UserScript==

// ---------------- Toggles ----------------
// Gets values from storage if they exist, else sets everything to true, enabling all functiosn of script.
const toggleUserColors = true;
const toggleScrollToTopButton = true;
const toggleSideBar = true;

// ---------------- Color Users ----------------
// Function to generate a random color based on hashed username
// Ensures whenever you see a user they consistently have the same color. Also makes sure color is not too bright or dark to read.
function getConsistentColor (username) {
  let hash = 0
  if (username.startsWith('@')) {
    username = username.substring(1) // Remove the '@' symbol from the hash for consistent coloring.
  }
  if (username.startsWith('/u/')) {
    username = username.substring(3) // Remove the '/u/' symbol from the hash for consistent coloring.
  }

  // Calculate a hash value of the username
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
    hash ^= 0xFFFFAA
    hash |= 0
  }

  // Convert the hash value to RGB values
  const r = ((hash & 0xFF0000) >> 16)
  const g = ((hash & 0x00FF00) >> 8)
  const b = ((hash & 0x0000FF) >> 0)

  // Convert RGB values to hexadecimal color code
  const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  // Calculate brightness with magic math.
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const darkness = (r + g + b) / 3

  // Check if the brightness or darkness is out of the desired range
  // Adjust the values however you want, if you make the possible range too small you may near infinite loop while it tries over and over to generate colors for people
  const brightnessThreshold = 200
  const darknessThreshold = 50
  if (brightness > brightnessThreshold || darkness < darknessThreshold || brightness < darknessThreshold) {
    // Append an underscore to the username and recursively call the function again to generate a fresh color
    username += '_'
    return getConsistentColor(username)
  }
  return color
}

// function to loop the usernames on the page, compileing names into maps then applies color to those maps.
// Idea behind the mapping is that coloring all of a users comments at once skips the need to hash their name and calculate the color over and over, should be more efficient, but I'm dumb so who knows.
function applyConsistentColorToUserNames () {
  const userLinks = document.getElementsByClassName('link-user')
  const userMap = {}

  for (let i = 0; i < userLinks.length; i++) {
    const link = userLinks[i]
    const username = link.textContent
    if (!userMap.hasOwnProperty(username)) {
      userMap[username] = []
    }
    userMap[username].push(link)
  }

  // Apply consistent color to all instances of each username
  for (const username in userMap) {
    if (userMap.hasOwnProperty(username)) {
      const color = getConsistentColor(username)
      const userInstances = userMap[username]
      for (let i = 0; i < userInstances.length; i++) {
        const link = userInstances[i]
        link.style.color = color
      }
    }
  }
}

// ---------------- Custom Sidebar Menu ------------------

function adjustSidebar() {
  const sidebarHeader = document.createElement('li')
  const sidebarHeaderText = document.createTextNode('Personal')
  sidebarHeader.appendChild(sidebarHeaderText)

  const sidebarLinksList = document.createElement('li')
  const sidebarLinksul = document.createElement('ul')
  sidebarLinksul.setAttribute("class", "nav nav-group-list")
  sidebarLinksList.appendChild(sidebarLinksul)

  const tildesUser = document.querySelector('a.logged-in-user-username')

  let sidebarLinks = {
    "Bookmarks": {
      "title": "Bookmarks",
      "url": "https://tildes.net/bookmarks"
    },
    "Posts": {
      "title": "Posts",
      "url": tildesUser
    }
  }

  for (let keys in sidebarLinks){
    const li = document.createElement('li')
    li.setAttribute('class', 'nav-item')
    let sidebarLinkA = document.createElement('a')
    sidebarLinkA.setAttribute('href', sidebarLinks[keys].url)
    let sidebarLinkAText = document.createTextNode(sidebarLinks[keys].title)
    sidebarLinkA.appendChild(sidebarLinkAText)
    li.appendChild(sidebarLinkA)
    sidebarLinksul.appendChild(li)
  }

  const sideBar = document.querySelector('aside#sidebar ul.nav')
  sideBar.prepend(sidebarHeader, sidebarLinksList)
}

if (toggleUserColors) { applyConsistentColorToUserNames() }
if (toggleSideBar) { adjustSidebar() }
