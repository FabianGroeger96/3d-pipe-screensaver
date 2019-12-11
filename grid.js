/*
Directions
0: x
1: y
2: z
----------
0: positive
1: negative
 */

/* const */
const start_next_pipe_after_number_of_elements = 30;
const size_x = 100;
const size_y = 100;
const size_z = 100;

/* Helpers */

function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}
function getRandomInt(max){
    max = max;
    return Math.floor(Math.random() * Math.floor(max))
}
function dim(mat) {
    if (mat instanceof Array) {
        return [mat.length].concat(dim(mat[0]));
    } else {
        return [];
    }
}
function getElementFromDirection(tile_info){
    let element = tile_info[0];
    let direction = tile_info[1];
    if (element === 0){
        return direction;
    }
    if (element === 1){
        return 3;
    }
}

/* Grid */

function createGrid(grid_size) {
    return zeros(grid_size)
}
function getRandomTile(grid_size){
    var x_start = getRandomInt(grid_size[0]);
    var y_start = getRandomInt(grid_size[1]);
    var z_start = getRandomInt(grid_size[2]);
    var tile = [x_start, y_start, z_start];
    return tile;
}
function registerUsedGridTile(grid, tile){
    grid[tile[0]][tile[1]][tile[2]] = 1;
}

/* Grid Check */

function legalGridTile(grid, next_tile){
    return grid[next_tile[0]][next_tile[1]][next_tile[2]] === 0;
}
function walkInDirectionFromTile(tile, walk_axis, direction){
    var next_tile = tile.slice();
    if (direction === 0){
        next_tile[walk_axis] += 1;
    }
    if (direction === 1){
        next_tile[walk_axis] -= 1;
    }
    return next_tile;
}
function checkIfEligibleDirection(grid, tile, walk_axis, direction){
    let next_tile = walkInDirectionFromTile(tile, walk_axis, direction);
    let grid_dimensions = dim(grid);
    for (var i = 0; i < grid_dimensions.length; i++){
        if (next_tile[i] >= grid_dimensions[i] || next_tile[i] < 0){
            return false;
        }
    }
    if (grid[next_tile[0]][next_tile[1]][next_tile[2]] === 1){
        return false;
    }
    return true;

}

/* Pipe */

function createPipe(grid){
    var pipe = [];
    do {
        do {
            var start_tile = getRandomTile(dim(grid));
        } while (legalGridTile(grid, start_tile) === false);
        var walk_axis = getRandomInt(3);
        var direction = getRandomInt(2);
    } while (!checkIfEligibleDirection(grid, start_tile, walk_axis, direction));
    registerUsedGridTile(grid, start_tile);
    var tileInfo = [1, walk_axis, direction];
    var element = getElementFromDirection(tileInfo);
    var pipe_step = [start_tile, element, tileInfo];
    pipe.push(pipe_step);
    return pipe;
}
function makePipeStep(grid, pipe){
    let last_pipe_step = pipe[pipe.length - 1];
    let last_tile = last_pipe_step[0];
    let tile_info = last_pipe_step[2];
    let walk_axis = tile_info[1];
    let direction = tile_info[2];
    let is_curve = getRandomInt(8);
    let next_tile = walkInDirectionFromTile(last_tile, walk_axis, direction);
    if (!checkIfEligibleDirection(grid, next_tile, walk_axis, direction)){
        is_curve = 0;
    }
    if (is_curve !== 0){
        var new_tile_info = tile_info.slice();
        new_tile_info[0] = 0;
    }
    if (is_curve === 0){
        do {
            var new_walk_axis = getRandomInt(3);
            var new_direction = getRandomInt(2);
        } while (new_walk_axis === walk_axis || !checkIfEligibleDirection(grid, next_tile, new_walk_axis, new_direction));
        var new_tile_info = [1, new_walk_axis, new_direction];
    }
    registerUsedGridTile(grid, next_tile);
    var element = getElementFromDirection(new_tile_info);
    var next_step = [next_tile, element, new_tile_info];
    pipe.push(next_step);
    return pipe;
}

/* Generator */

function getPaths(grid_size, element_count, pipes){
    let filler_step = [[-1, -1, -1], -1, [-1, -1, -1]];
    let paths = [];
    let grid = createGrid(grid_size);
    for (let i = 0; i < pipes; i++){
        let pipe = createPipe(grid);
        for (let j = 0; j < element_count - 1; j++){
            pipe = makePipeStep(grid, pipe);
        }
        let padded_pipe = [];
        let filler_pre = [];
        for (let j = 0; j < i * start_next_pipe_after_number_of_elements; j++){
            filler_pre.push(filler_step)
        }
        padded_pipe = filler_pre.concat(pipe);
        let filler_post = [];
        for (let j = 0; j < (pipes - i) * start_next_pipe_after_number_of_elements; j++){
            filler_post.push(filler_step)
        }
        padded_pipe = padded_pipe.concat(filler_post);
        paths.push(padded_pipe);
    }
    return paths;
}

function shortPaths(paths){
    var shortPaths = [];
    for (var i = 0; i < paths.length; i++){
        var path = [];
        for (var j = 0; j < paths[i].length; j++){
            path.push([paths[i][j][0], paths[i][j][1]]);
        }
        shortPaths.push(path)
    }
    return shortPaths;
}

function main() {
    let grid_size = [size_x, size_y, size_z];
    let element_count = 200;
    let pipes = 1;
    let paths = getPaths(grid_size, element_count, pipes);
    let short_paths = shortPaths(paths);
    console.log(short_paths);
}