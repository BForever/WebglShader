// Default camera values
const YAW = -90.0;
const PITCH = 0.0;
const SPEED = 0.0025;
const SENSITIVITY = 0.05;
const ZOOM = 45.0;
const DIRECTION = {
    FORWARD: "w",
    BACKWARD: "s",
    LEFT: "a",
    RIGHT: "d",
    ARROWUP:"ArrowUp",
    ARROWDOWN:"ArrowDown",
    ARROWLEFT:"ArrowLeft",
    ARROWRIGHT:"ArrowRight",
};

function Camera() {
    this.Position = new Vector3([0,0,2]);
    this.Front = new Vector3([0,0,-1]);
    this.Up = new Vector3([0,1,0]);
    this.Right = new Vector3([1,0,0]);
    this.WorldUp = new Vector3([0,1,0]);

    // Euler Angles
    this.Yaw = YAW;
    this.Pitch = PITCH;
    // Camera options
    this.MovementSpeed = SPEED;
    this.MouseSensitivity = SENSITIVITY;
    this.Zoom = ZOOM;
}

Camera.prototype.getViewMatrix = function () {
    let center = this.Position.add(this.Front);
    return (new Matrix4()).lookAt(
        this.Position.elements[0], this.Position.elements[1], this.Position.elements[2],
        center.elements[0], center.elements[1], center.elements[2],
        this.Up.elements[0], this.Up.elements[1], this.Up.elements[2]);
};

Camera.prototype.ProcessPosition = function (direction, deltaTime) {
    let velocity = this.MovementSpeed * deltaTime;
    if (direction === DIRECTION.FORWARD)
        this.Position = this.Position.add(this.Front.scalarmultiply(velocity));
    if (direction === DIRECTION.BACKWARD)
        this.Position = this.Position.minus(this.Front.scalarmultiply(velocity));
    if (direction === DIRECTION.LEFT)
        this.Position = this.Position.minus(this.Right.scalarmultiply(velocity));
    if (direction === DIRECTION.RIGHT)
        this.Position = this.Position.add(this.Right.scalarmultiply(velocity));
};

Camera.prototype.ProcessRotation = function (xoffset, yoffset, constrainPitch = true) {
    xoffset *= this.MouseSensitivity;
    yoffset *= this.MouseSensitivity;

    this.Yaw += xoffset;
    this.Pitch += yoffset;

    // Make sure that when pitch is out of bounds, screen doesn't get flipped
    if (constrainPitch) {
        if (this.Pitch > 89.0)
            this.Pitch = 89.0;
        if (this.Pitch < -89.0)
            this.Pitch = -89.0;
    }

    // Update Front, Right and Up Vectors using the updated Euler angles
    this.updateCameraVectors();
};

Camera.prototype.ProcessMouseScroll = function (yoffset) {
    if (this.Zoom >= 1.0 && this.Zoom <= 45.0)
        this.Zoom -= yoffset;
    if (this.Zoom <= 1.0)
        this.Zoom = 1.0;
    if (this.Zoom >= 45.0)
        this.Zoom = 45.0;
};

Camera.prototype.updateCameraVectors = function () {
    // Calculate the new Front vector
    var front = new Vector3();
    front.elements[0] = Math.cos(radians(this.Yaw)) * Math.cos(radians(this.Pitch));
    front.elements[1] = Math.sin(radians(this.Pitch));
    front.elements[2] = Math.sin(radians(this.Yaw)) * Math.cos(radians(this.Pitch));
    this.Front = front.normalize();
    // Also re-calculate the Right and Up vector
    this.Right = this.Front.cross(this.WorldUp).normalize();
    this.Up = this.Right.cross(this.Front).normalize();
};

function radians(degree) {
    return degree * Math.PI / 180;
}