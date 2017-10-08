
$("#fovSpinner").spinner({
	min: 10.0,
	max: 80.0,
	step: 0.1
});

$("#eyeHeightSpinner").spinner({
    min: 0.1,
    max: 1.0,
    step:0.01
});

function getFov() {
	var val = $("#fovSpinner").spinner("value");
	if(val <= 0) {
		val = 10;
	} else if(val >= 80) {
		val = 80;
	}

	return val * Math.PI / 180.0;
}

function getEyeHeight() {
    var val = $("#eyeHeightSpinner").spinner("value");
    if (val <= 0.1) {
        return 0.1;
    } else if (val >= 1) {
        return 1;
    }
    return val;
}

function getMazeStrings() {
    return $("#mazeTextArea").val().trim().split(/\s/);
}


// convert it to constructor later
function createMazeFromStrings(strings) {
    var sizeY = strings.length;
    var sizeX = strings[0].length;

    var x, y;
    for(y=0;y<sizeY;y++) {
        if (strings[y].length != sizeX) {
            throw new Error("Mesh is not a rectangle!");
        }
    }

    var data = [];
    for (x = 0; x < sizeX; x++) {
        var a = [];
        for (y = 0; y < sizeY; y++) {
            a.push(null);
        }
        data.push(a);
    }

    var startPosition = null;
    var startHeading = null;
    for (x = 0; x < sizeX; x++) {
        for (y = 0; y < sizeY; y++) {
            var c = strings[sizeY - y - 1][x];
            if (c == "#") {
                data[x][y] = 1;
            } else {
                data[x][y] = 0;
            }

            if (c == "N" || c == "E" || c == "W" || c == "S") {
                if (startPosition == null) {
                    if (c == "N") {
                        startHeading = 1;
                    } else if (c == "E") {
                        startHeading = 0;
                    } else if (c == "W") {
                        startHeading = 2;
                    } else if (c == "S") {
                        startHeading = 3;
                    }
                    startPosition = [x, y];
                } else {
                    throw new Error("There are more than one starting point!");
                }
            }
        }
    }

    if (startPosition == null) {
        throw new Error("There is no starting point!");
    }

    for(x=0;x<sizeX;x++) {
        if (data[x][0] != 1) {
            throw new Error("Boundary is not complete!");
        }
        if (data[x][sizeY-1] != 1) {
            throw new Error("Boundary is not complete!");
        }
    }
    for(y=0;y<sizeY;y++) {
        if (data[0][y] != 1) {
            throw new Error("Boundary is not complete!");
        }
        if (data[sizeX-1][y] != 1) {
            throw new Error("Boundary is not complete!");
        }
    }

    return {
        sizeX: sizeX,
        sizeY: sizeY,
        data: data,
        startHeading: startHeading,
        startPosition: startPosition
    };
}

var ROTATE = Math.PI / 2;
var eps = 0.05;
var frameCap = 20;

var camera = new Camera();

var directions = {
    0 : vec3.fromValues(1, 0, 0),
    1 : vec3.fromValues(0, 1, 0),
    2 : vec3.fromValues(-1, 0, 0),
    3 : vec3.fromValues(0, -1, 0),
};

var up = vec3.fromValues(0, 0, 1);

function posMod(x, y){
    return ((x%y) + y) % y;
}

var maze = null;
function updateMaze() {
	maze = createMazeFromStrings(getMazeStrings());
	camera.initEye(maze);
}

updateMaze();

$("#updateMazeButton").on("click", updateMaze);


    var dialog, form, 
    mazeTextArea = $("#mazeTextArea"),
    allFields = $([]).add(mazeTextArea);
    dialog = $("#dialog-form").dialog({
      autoOpen: false,
      height: 400,
      width: 350,
      modal: true,
      buttons: {
        "update": updateMaze,

        Cancel: function() {
            dialog.dialog("close");
        }
      }
      // close: function() {
      //   form[ 0 ].reset();
      //   allFields.removeClass( "ui-state-error" );
      // }

    });

    form = dialog.find( "form" );


$("#webglCanvas").on("keydown", function (event) {
    if(event.keyCode == 77) dialog.dialog( "open" );
    camera.updateEye(event.keyCode, eps);
});





