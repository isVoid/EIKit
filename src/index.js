const {ipcRenderer} = require('electron')
window.$ = window.jQuery = require('jquery'); // not sure if you need this at all
window.Bootstrap = require('bootstrap');

var oldEI = []
var newEI = []
var newClips = []
var oldClips = []
var droppedClips = []
var clipsRemainUnchanged = []
var clipsCutPointChanged = []
var clipsSourcePointChanged = []
var clipsTrackChanged = []
var clipsFPSChanged = []
var clipVue = new Vue({
    el : '#ClipChangeDiv',
    data : {
        title : '',
        CArr : []
    }
})

function showOldEISelector() {
    oldEI = []
    ipcRenderer.send("openOldEISelector")
    ipcRenderer.on("OldEIResponse", (event, params) => {
        if (params['C'] == 'C' &&
            params['Name'] != 'Text')
            oldEI.push(params)
    })
}

function showNewEISelector() {
    newEI = []
    ipcRenderer.send("showNewEISelector")
    ipcRenderer.on("NewEIResponse", (event, params) => {
        if (params['C'] == 'C' &&
            params['Name'] != 'Text')
            newEI.push(params)
    })
}

function computeNewClip() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }

    newClips = []
    for (let i = 0; i < newEI.length; i++) {
        var exists = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name) 
            {
                exists = true;
            }
        }
        if (!exists) {
            newClips.push(newEI[i])
        }
    }

   clipVue.title = 'New Clips Added'
   clipVue.CArr = newClips
}

function computeDroppedClip() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }

    droppedClips = []
    for (let i = 0; i < oldEI.length; i++) {
        var dropped = true;
        for (let j = 0; j < newEI.length; j++) {
            if (oldEI[i].Name == newEI[j].Name)
            {
                dropped = false;
            }
        }
        if (dropped) {
            droppedClips.push(oldEI[i])
        }
    }

    clipVue.title = 'Clips dropped'
    clipVue.CArr = droppedClips
}

function computeOldClip() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }

    oldClips = []
    for (let i = 0; i < newEI.length; i++) {
        var exists = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name) 
            {
                exists = true;
            }
        }
        if (exists) {
            oldClips.push(newEI[i])
        }
    }

   clipVue.title = 'Old Clips'
   clipVue.CArr = oldClips
}

// A Clip Remain Unchanged is defined as follows:
// The clip is the same in following attributes:
// Rec In/Rec Out
// Src In/Src Out
// VTrack
// Source FPS
function computeUnchangedClips() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }
    // console.log(newEI)
    // console.log(oldEI)
    clipsRemainUnchanged = []
    for (let i = 0; i < newEI.length; i++) {
        // console.log(newEI[i]['Record In'])
        var same = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name && 
                oldEI[j]['Record In'] == newEI[i]['Record In'] &&
                oldEI[j]['Record Out'] == newEI[i]['Record Out'] &&
                oldEI[j]['Source In'] == newEI[i]['Source In'] &&
                oldEI[j]['Source Out'] == newEI[i]['Source Out'] &&
                oldEI[j]['V'] == newEI[i]['V'] &&
                oldEI[j]['Source FPS'] == newEI[i]['Source FPS']
            ) 
            {
                same = true;
            }
        }
        if (same) {
            clipsRemainUnchanged.push(newEI[i])
        }
    }
    clipVue.title = 'Clips Remain Unchanged'
    clipVue.CArr = clipsRemainUnchanged
}

// A Clip that has a cut point changed is defined as follows:
// The clip is in old EI as well as in new EI
// The clip in old EI has either a different Rec In or Rec Out in the new EI
function computeCutPointChangeClips() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }

    // console.log(newEI)
    // console.log(oldEI)
    clipsCutPointChanged = []
    for (let i = 0; i < newEI.length; i++) {
        // console.log(newEI[i]['Record In'])
        var cutChanged = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name && 
                (oldEI[j]['Record In'] != newEI[i]['Record In'] ||
                oldEI[j]['Record Out'] != newEI[i]['Record Out'])
            ) 
            {
                console.log(oldEI[j])
                console.log(newEI[i])
                cutChanged = true;
            }
        }
        if (cutChanged) {
            clipsCutPointChanged.push(newEI[i])
        }
    }
    
    clipVue.title = 'Clips Cut Point Changed'
    clipVue.CArr = clipsCutPointChanged
}

// A Clip Source Changed is defined as follows:
// The clip is in old EI as well as in new EI
// The clip in oldEI has a different Src In/Out with that of 
function computeSourceChangedClip() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }
    // console.log(newEI)
    // console.log(oldEI)
    clipsSourcePointChanged = []
    for (let i = 0; i < newEI.length; i++) {
        // console.log(newEI[i]['Record In'])
        var sourceChanged = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name && 
                (oldEI[j]['Source In'] != newEI[i]['Source In'] ||
                oldEI[j]['Source Out'] != newEI[i]['Source Out'])
            ) 
            {
                console.log(oldEI[j])
                console.log(newEI[i])
                sourceChanged = true;
            }
        }
        if (sourceChanged) {
            clipsSourcePointChanged.push(newEI[i])
        }
    }
    clipVue.title = 'Clips Source Changed'
    clipVue.CArr = clipsSourcePointChanged
}

// A Clip Source Changed is defined as follows:
// The clip is in old EI as well as in new EI
// The clip in oldEI has a different Src In/Out with that of 
function computeTrackChangedClip() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }
    // console.log(newEI)
    // console.log(oldEI)
    clipsTrackChanged = []
    for (let i = 0; i < newEI.length; i++) {
        // console.log(newEI[i]['Record In'])
        var trackChanged = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name && 
                (oldEI[j]['V'] != newEI[i]['V'])
            ) 
            {
                console.log(oldEI[j])
                console.log(newEI[i])
                sourceChanged = true;
            }
        }
        if (sourceChanged) {
            clipsTrackChanged.push(newEI[i])
        }
    }
    clipVue.title = 'Clips Track Changed'
    clipVue.CArr = clipsTrackChanged
}

// A Clip Source Changed is defined as follows:
// The clip is in old EI as well as in new EI
// The clip in oldEI has a different Src In/Out with that of 
function computeFPSChangedClips() {
    if (oldEI == undefined) {
        alert ("oldEI is not selected")
        return
    }
    if (newEI == undefined) {
        alert ('newEI is not selected')
        return
    }
    // console.log(newEI)
    // console.log(oldEI)
    clipsFPSChanged = []
    for (let i = 0; i < newEI.length; i++) {
        // console.log(newEI[i]['Record In'])
        var fpsChanged = false;
        for (let j = 0; j < oldEI.length; j++) {
            if (oldEI[j].Name == newEI[i].Name && 
                (oldEI[j]['Source FPS'] != newEI[i]['Source FPS'])
            ) 
            {
                console.log(oldEI[j])
                console.log(newEI[i])
                fpsChanged = true;
            }
        }
        if (fpsChanged) {
            clipsFPSChanged.push(newEI[i])
        }
    }
    clipVue.title = 'Clips FPS Changed'
    clipVue.CArr = clipsFPSChanged
}