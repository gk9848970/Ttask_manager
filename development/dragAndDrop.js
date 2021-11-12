import addGlobalEventListener from './utils/addGlobalEventListener.js';

/* 
    1. Move with pointer Thing.
    Hide Original and Add Clone to cursor position
    2. Ghost at leave Placeholder
    -- Create Ghost
    -- Insert Ghost for selected Task
    3. Dynamic Ghost - According to current pointer Position
*/

const isTouchDevice = () => {  
    return (('ontouchstart' in window) ||  
      (navigator.maxTouchPoints > 0) ||  
      (navigator.msMaxTouchPoints > 0));  
}

function SetEvents() {
    if(isTouchDevice()) {
        pointerDown = 'touchstart'
        pointerMove = 'touchmove'
        pointerUp = 'touchend'
    }
      
    else {
        pointerDown = 'mousedown'
        pointerMove = 'mousemove'
        pointerUp = 'mouseup'
    }
}

let pointerDown
let pointerMove
let pointerUp
SetEvents()

export default function setup(OnDragComplete) {
    addGlobalEventListener(pointerDown, "[data-draggable]", e => {
        // Selected task Details
        const selectedItem = e.target
        const selectedItemDimensions = BoundingRect(selectedItem)
        const offsets = ClickOffset(e, selectedItemDimensions.top, selectedItemDimensions.left)

        // Cloning Selected task to move with pointer cursor
        const cloneItem = selectedItem.cloneNode(true)
        cloneItem.classList.add('dragging')
        SetWidthAndHeight(cloneItem, selectedItemDimensions.width, selectedItemDimensions.height)

        // Ghost - The grey like shadow where task element will be inserted if dropped
        const ghost = selectedItem.cloneNode()
        ghost.classList.add('ghost')
        SetWidthAndHeight(ghost, selectedItemDimensions.width, selectedItemDimensions.height)
        InsertGhost(ghost, e)
        
        // Hide Task and Attach clone to pointer
        selectedItem.classList.add('hide') 
        PositionClone(cloneItem, e, offsets.offsetX, offsets.offsetY)
        document.body.appendChild(cloneItem)
        
        const pointerMoveFunction = (e) => {
            // We position clone and ghost dynamically w.r.t. current pointer position
            PositionClone(cloneItem, e, offsets.offsetX, offsets.offsetY)
            InsertGhost(ghost, e)
        }

        document.addEventListener(pointerMove, pointerMoveFunction);

        document.addEventListener(pointerUp, (e) => {
            // Clone has to be removed now and selected task to be dropped at ghost position
            document.removeEventListener(pointerMove, pointerMoveFunction)
            selectedItem.classList.remove('hide')
            ghost.replaceWith(selectedItem)
            cloneItem.remove()
            // When all the drag and drop is Complete Run this callback
            OnDragComplete()
        })
    })
    
}

function PositionClone(clone, e, offsetX, offsetY) {
    if(isTouchDevice()) {
        clone.style.top = `${e.touches[0].clientY - offsetY}px`
        clone.style.left = `${e.touches[0].clientX - offsetX}px`
    }
    else {
        clone.style.top = `${e.clientY - offsetY}px`
        clone.style.left = `${e.clientX - offsetX}px`
    }
}

function InsertGhost(ghost, e) {
    let target
    if(isTouchDevice()) {
        target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
    }
    else {
        target = e.target
    }
    const parent = target.closest('[data-draglist]')
    if(parent == null) return
    
    const insertBeforeTask = InsertBefore(e)
    if(insertBeforeTask == null) { 
        parent.appendChild(ghost)
    }
    else {
        parent.insertBefore(ghost, insertBeforeTask)
    }
}

function InsertBefore(e) {
    let target
    if(isTouchDevice()) {
        target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
    }
    else {
        target = e.target
    }
    const parent = target.closest('[data-draglist]')
    const tasksArray = Array.from(parent.children)
    const insertBeforeTask = tasksArray.find(task => {
        const taskDimensions = BoundingRect(task)
        if(isTouchDevice()) {
            return e.touches[0].clientY < taskDimensions.top + (taskDimensions.height / 2)
        }
        else {
            return e.clientY < taskDimensions.top + (taskDimensions.height / 2)
        }
    })
    return insertBeforeTask
}

export function BoundingRect(element) {
    let dimensions = {
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
        top: element.getBoundingClientRect().top,
        left: element.getBoundingClientRect().left,
    }
    return dimensions
}

function ClickOffset(e, elementTop, elementLeft) {
    let offset
    if(isTouchDevice()) {
        offset = {
            offsetX: e.touches[0].clientX - elementLeft,
            offsetY: e.touches[0].clientY - elementTop
        }
    }
    else {
        offset = {
            offsetX: e.clientX - elementLeft,
            offsetY: e.clientY - elementTop
        }
    }
    return offset
}

function SetWidthAndHeight(element, width, height) {
    element.style.width = `${width}px`
    element.style.height = `${height}px`
}