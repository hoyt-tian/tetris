import {buildMatrix} from './Grid';

class AI{
    constructor(a, b ,c, d){
        this.alpha = a || Math.random();
        this.beta = b || Math.random();
        this.gama = c || Math.random();
        this.delta = d || Math.random();
    }

    static fullLineCount(matrix, game){
        let count = 0;
        for(let i=game.rows-1; i>=0; i--){
            if(AI.isFullLine(matrix, i, game.cols)){
                count++;
            }
        }
        return count;
    }

    static colHeight(matrix, col, rows){
        for(let i=0; i<rows; i++){
            if(matrix[i][col] != null) return rows - i;
        }
        return 0;
    }

    static holeCount(matrix, col, rows){
        let top = rows;
        for(let i=0; i<rows; i++){
            if(matrix[i][col] != null){
                top = i;
                break;
            }
        }

        let count = 0;
        for(let i=top; i<rows; i++){
            if(matrix[i][col] == null){
                count++;
            }
        }

        return count;
    }

    static state(matrix, game){
        let fulllines = AI.fullLineCount(matrix, game);
        let avgHeight = 0;

        let last = null;
        let delta = 0;
        for(let i=0; i<game.cols; i++){
            let height = AI.colHeight(matrix, i, game.rows) - fulllines;
            if(last!=null){
                delta += Math.abs(height - last);
            }
            last = height;
            avgHeight +=  height;
        }
        avgHeight = avgHeight/game.cols;

        let holeCount = 0;
        for(let i=0; i<game.cols; i++){
            holeCount += AI.holeCount(matrix, i, game.rows);
        }
        return {
            clear: fulllines,
            avgh: avgHeight,
            hc: holeCount,
            delta: delta
        };
    }

    think(game){ 
        let tetris = game.state.active;
        let origin = {
            row: tetris.row,
            col: tetris.col,
            matrix: buildMatrix(game.rows, game.cols, (row, col)=>{
                return game.state.data[row][col];
            })
        };
        let result = [];
        for(let i=0; i<4; i++){

            do{
                while(game.moveActiveDown()){
                    ;
                }
                game.merge(tetris);
                let state = AI.state(game.state.data, game);
                result.push({
                    state: state,
                    turn: i,
                    row:tetris.row,
                    col:tetris.col
                });
                
                
                tetris.setPos(origin.row, tetris.col);                
                game.state.data = buildMatrix(game.rows, game.cols, (i, j)=>{
                    return origin.matrix[i][j];
                });

            }while(game.moveActiveLeft());

            tetris.setPos(origin.row, origin.col);

            while(game.moveActiveRight()){
                while(game.moveActiveDown()){
                    ;
                }

                game.merge(tetris);
                let state = AI.state(game.state.data, game);
                result.push({
                    state: state,
                    turn: i,
                    row:tetris.row,
                    col:tetris.col                   
                });
                
                
                tetris.setPos(origin.row, tetris.col);                
                game.state.data = buildMatrix(game.rows, game.cols, (i, j)=>{
                    return origin.matrix[i][j];
                });
            }

            tetris.setPos(origin.row, origin.col);
            tetris.turn(true);
        }
        tetris.setPos(origin.row, origin.col);
        game.state.data = origin.matrix;
        return this.actions(result, tetris, game);
    }

    actions(result, tetris, game){

        if(result.length<=0) return [];

        result.forEach((item)=>{
            item.score = AI.caculate(item.state, game.ai);
        });

        result.sort((a,b)=>{ return b.score - a.score; });

        let target = result[0];
        let steps = [];
        switch(target.turn){
            case 0:
                break;
            case 1:
                steps.push({code:0x28,desc:"TR"});
                break;
            case 2:
                steps.push({code:0x28,desc:"TR"});
                steps.push({code:0x28,desc:"TR"});
                break;
            case 3:
                steps.push({code:0x26,desc:"TL"});
                break;
        }
        if(tetris.col < target.col){
            for(let i=tetris.col; i<target.col; i++){
                steps.push({code:0x27,desc:"MR"});                
            }
        }else if(tetris.col > target.col){
            for(let i=target.col; i<tetris.col; i++){
                steps.push({code:0x25,desc:"ML"});                
            }
        }

        for(let i=tetris.row; i<target.row; i++){
            steps.push({code:0x20,desc:"MD"});            
        }
        return steps;
    }

    static caculate(state, ai){
        return state.clear * ai.alpha + state.avgh * ai.beta + state.hc * ai.gama + ai.delta * state.delta;
    }

    static isFullLine(matrix, line, cols){
        for(let i=0; i<cols; i++){
            if(matrix[line][i] == null) return false;
        }
        return true;
    }
}

export default AI;