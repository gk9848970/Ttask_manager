/*
    1. Save on Reload Tasks
    -- Sync between Lanes and Javscript
        -- Load Everthing just from javascript
    -- Local Storage and Loading
*/
import setupDragAndDrop, { BoundingRect as BoundingRect} from "./dragAndDrop.js";
import addGlobalEventListener from './utils/addGlobalEventListener.js';

setupDragAndDrop(OnDragComplete)

function OnDragComplete() {
    SaveLanesObject()
    SaveInLocalStorage()
}

const LOCAL_STORAGE_PREFIX = "Trello-"
const LOCAL_STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}data`

const DEFAULT_LANES = {
    laneNames: ["Backlog", "Current", "Done"],
    laneTasks: [
        ["Demo Task 1", "Demo Task 2"], 
        ["Demo Task 3"], 
        ["Demo Task 4", "Demo Task 5"]
    ],
    numberOfLanes: 3
}
let CURRENT_LANES = LoadFromLocalStorage() || DEFAULT_LANES

RenderLanes()

// Lane Object in JavaScript

function SaveLanesObject() {
    SaveLaneNames()
    SaveNumberOfLanes()
    SaveTaskNames()
}

function SaveLaneNames() {
    CURRENT_LANES.laneNames = GetLaneNamesArray()
}

function SaveNumberOfLanes() {
    CURRENT_LANES.numberOfLanes = CURRENT_LANES.laneNames.length
}

function SaveTaskNames() {
    const lanes = Array.from(document.querySelectorAll('.lane'))
    let laneTasks = []
    for (let i = 0; i < CURRENT_LANES.numberOfLanes; i++) {
        let taskNamesArray = GetLaneTasksArray(lanes[i])
        laneTasks.push(taskNamesArray)
    }
    CURRENT_LANES.laneTasks = laneTasks
}

// Local Storage

function SaveInLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(CURRENT_LANES))
}

function LoadFromLocalStorage() {
    const lanesObject = localStorage.getItem(LOCAL_STORAGE_KEY)
    return JSON.parse(lanesObject)
}

// JavaScript/Html Interaction

function GetLaneNamesArray() {
    let laneNames = []
    const lanes = document.querySelectorAll('.lane')
    lanes.forEach(lane => {
        let name = GetLaneName(lane)
        laneNames.push(name)
    })
    return laneNames
}

function GetLaneName(lane) {
    const header = lane.querySelector('.header')
    return header.innerHTML
}

function GetLaneTasksArray(lane) {
    let taskNames = []
    const tasks = lane.querySelectorAll('.task')
    tasks.forEach(task => {
        const taskName = task.querySelector('.task-text')
        const name = taskName.innerHTML
        taskNames.push(name)
    })
    return taskNames
}

// Rendering Lanes from JavaScript Object (CURRENT_LANES)

function RenderLanes() {
    for (let i = 0; i < CURRENT_LANES.numberOfLanes; i++) {
        let laneName = CURRENT_LANES.laneNames[i]
        let lane = CreateLane(laneName)

        let taskNamesArray = CURRENT_LANES.laneTasks[i]
        taskNamesArray.forEach(taskName => {
            let task = CreateTask(taskName)
            AddTaskToLane(lane, task)
        })

        AddLaneToPage(lane)
    }
}

// Creating from Template, Lane and Task

function CreateLane(name) {
    const laneTemplate = document.querySelector('.template-lane')
    let laneFragment = laneTemplate.content.cloneNode(true)
    let laneHeader = laneFragment.querySelector('.header')
    laneHeader.innerHTML = `${name}`
    return laneFragment
}

function CreateTask(taskName) {
    const taskTemplate = document.querySelector('.template-task')
    let taskFragment = taskTemplate.content.cloneNode(true)
    let taskText = taskFragment.querySelector('.task-text')
    taskText.innerHTML = `${taskName}`
    return taskFragment
}

// Adding Elements To Dom

function AddTaskToLane(lane, task) {
    const taskList = lane.querySelector('.tasks')
    taskList.appendChild(task)
}

function AddLaneToPage(lane) {
    let lanes = document.querySelector('.lanes')
    lanes.appendChild(lane)
}

// Task Input New Task

addGlobalEventListener('submit', ".form-task", e => {
    e.preventDefault()
    const taskInput = e.target.querySelector('.task-input')
    const taskText = taskInput.value
    
    if(taskText === '') return
    const lane = e.target.closest('.lane')
    const newTask = CreateTask(taskText)
    AddTaskToLane(lane, newTask)
    
    SaveLanesObject()
    SaveInLocalStorage()

    taskInput.value = ''
})

// Remove Task Functionality

addGlobalEventListener('click', ".task-delete", e => {
    DeleteTask(e)
    SaveLanesObject()
    SaveInLocalStorage()
})

function DeleteTask(e) {
    const parent = e.target.closest('.task')
    parent.remove()
}

// Edit Task Name Functionality

let taskName;
const renameInput = document.querySelector('.task-rename-input')
const renameInputBG = document.querySelector('.input-rename-bg')

/* 
    Input is connected to a element called taskName
    We simplly keep changing to what that task name is pointing to 
    with each click on edit icon in a task 
*/

renameInput.addEventListener('input', () => {
    if(taskName) {
        taskName.innerHTML = renameInput.value
    }
})

addGlobalEventListener('click', ".task-rename", e => {
    const parentTask = e.target.closest('.task')
    const parentDimensions = BoundingRect(parentTask)

    PositionRenameInput(parentDimensions)
    ShowRenameInput()

    taskName = parentTask.querySelector('.task-text')
    renameInput.value = taskName.innerHTML
    renameInput.select();
})

addGlobalEventListener('submit', ".form-task-rename", e => {
    e.preventDefault()
    HideRenameInput()

//  When done we save the current state
    SaveLanesObject()
    SaveInLocalStorage()
})

addGlobalEventListener('click', ".input-rename-bg", e => {
    HideRenameInput()

//  When done we save the current state
    SaveLanesObject()
    SaveInLocalStorage()
})

function PositionRenameInput(dimensions) {
    renameInput.style.width = `${dimensions.width}px`
    renameInput.style.top = `${dimensions.top}px`
    renameInput.style.left = `${dimensions.left}px`
}

function ShowRenameInput() {
    renameInput.classList.add('active')
    renameInputBG.classList.add('active')
}

function HideRenameInput() {
    renameInput.classList.remove('active')
    renameInputBG.classList.remove('active')
}





