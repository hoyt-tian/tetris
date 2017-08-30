import React from 'react';

const TileWidth = 20;
const TileHeight = 20;
const TilePadding = 1;

class ColorPicker{

    static random(){
        let random = parseInt(Math.random() * 4);
        switch(random){
            case 0:
                return '#00A480';
            case 1:
                return '#0F4FA8';
            case 2:
                return '#FF9F00';
            case 3:
                return '#FF6200';
        }
    }

    static activeColor(){
        return '#FFEBCC';
    }
}

let tiles = {};

class Tile{
    static get(color){
        if(!tiles[color]){
            tiles[color] = new Tile(color);
        }
        return tiles[color];
    }

    constructor(color){
        this.color = color || ColorPicker.random();
    }
}


let shapes = [];
shapes.push(
    [
        "11",
        "11"
    ],
    [
        "100",
        "111"
    ],
    [
        "001",
        "111"
    ],
    [
        "110",
        "011"
    ],
    [
        "011",
        "110"
    ],
    [
        "111",
        "010"
    ],
    [
        "1",
        "1",
        "1",
        "1"
    ]
);

const buildMatrix = function(rows, cols, val){
    let array = new Array(rows);
    for(let i=0; i<rows; i++){
        array[i] = new Array(cols);
        for(let j=0; j<cols; j++){
            if(val){
                array[i][j] = typeof(val) === 'function'? val(i,j, array): val;
            }else{
                array[i][j] = null;
            }
        }
    }
    return array;
};

class Tetris{

    static getMatrix(){
        return shapes[parseInt(Math.random() * shapes.length)];
    }

    static clone(matrix){
        return buildMatrix(matrix.length, matrix[0].length, (i,j)=>{
            return matrix[i][j];
        });
    }

    static random(){
        let tetris = new Tetris(Tetris.getMatrix());
        let turn = parseInt(4 * Math.random());
        for(let i=0; i<turn; i++){
            tetris.turn();
        }
        return tetris;
    }

    static shape(i){
        return shapes[i];
    }

    static shapeCount(){
        return shapes.length;
    }

    constructor(matrix, color){
        this.data = Tetris.clone(matrix);
        this.color = color || ColorPicker.random();
        this.row = this.col = 0;
    }

    setPos(row, col){
        this.row = row;
        this.col = col;
    }

    width(){
        return this.data[0].length;
    }

    height(){
        return this.data.length;
    }

    getTile(row, col){
        if(this.data[row][col]!=="0") return Tile.get(this.color);
        return null;
    }

    clockwise(){
        let w = this.width(), h = this.height();
        let ndata = buildMatrix(w, h);
        for(let row = 0; row < h; row++){
            for(let col = 0; col < w; col++){
                ndata[col][h-1-row] = this.data[row][col];
            }
        }
        return ndata;
    }
    
    anticlockwise(){
        let w = this.width(), h = this.height();
        let ndata = buildMatrix(w, h);
        for(let row = 0; row < h; row++){
            for(let col = 0; col < w; col++){
                ndata[w-col-1][row] = this.data[row][col];
            }
        }
        return ndata;      
    }

    turn(clockwise, rows, cols){
        if(this.col + this.height() >= cols  || this.row+this.width() >= rows) return null;

        let ndata = clockwise?this.clockwise():this.anticlockwise();
        let result = {
            before:this.data,
            after:ndata
        }
        this.data = ndata;
        return result;
    }
}

class Grid extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            data : props.data
        }
    }

    render(){
        return React.createElement("canvas",{
            ref: "canvas",
            width: this.props.cols * TileWidth,
            height : this.props.rows * TileHeight
        });
    }

    componentDidUpdate(){
        let context = this.refs.canvas.getContext('2d');
        context.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        
        let tile = null;

        if(this.state.data && this.state.data.length && this.state.data[0].length){
            for(let row = 0; row < this.state.data.length; row++){
                for(let col=0; col < this.state.data[row].length; col++){
                    tile = this.state.data[row][col];
                    if(tile == null) continue;
                    context.fillStyle = tile.color;
                    context.fillRect(col * TileWidth, row * TileHeight , TileWidth -  TilePadding, TileHeight - TilePadding);
                }
            }
        }
        

        if(this.state.active){
            context.fillStyle = ColorPicker.activeColor();
            for(let row = 0; row < this.state.active.height(); row++){
                for(let col = 0; col < this.state.active.width(); col++){
                    tile = this.state.active.getTile(row, col);
                    if(tile){
                        context.fillStyle = tile.color;
                        context.fillRect( (this.state.active.col+col) * TileWidth, (this.state.active.row + row) * TileHeight, TileWidth - TilePadding, TileHeight - TilePadding);
                    }
                }
            }
        }
    }
}

export default Grid;
export {Tile, Tetris, buildMatrix};