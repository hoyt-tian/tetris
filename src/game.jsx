import React from 'react';
import ReactDOM from 'react-dom';
import Grid,{Tile, Tetris, buildMatrix} from './Grid';
import './style.scss';

function random(rows, cols){
    let data = buildMatrix(rows, cols);

    for(let i=0; i<data.length; i++){
        for(let j=0; j<data[i].length; j++){
            data[i][j] = new Tile();
        }
    }

    return data;
}


class Game extends React.Component{
    constructor(props){
        super(props);
        this.rows = props.rows || 20;
        this.cols = props.cols || 15;
        this.state = {
            total:0,
            score: 0,
            data: buildMatrix(this.rows, this.cols, null)
        };

        this.timer_input = null;
        this.interval_input = 500;

        this.enableKeyboard = true;
    }

    setPreviewPosition(tetris){
        tetris.setPos( (this.refs.preview.props.rows -  tetris.height())>>1 
                        , (this.refs.preview.props.cols - tetris.width())>>1 );
        return tetris;
    }

    setNewTertrisPosition(tetris){
        tetris.setPos(0,  (this.refs.main.props.cols - tetris.width()) >> 1);
        return tetris;
    }

    render(){
        return  (<div className="tetris">
            <Grid rows={this.rows} cols={this.cols} ref="main"/>
            <section>
                <Grid rows={5} cols={5} ref="preview" />
                <section>
                    <table>
                        <caption></caption>
                        <tbody>
                            <tr>
                                <td>Total</td><td>{this.state.total}</td>
                            </tr>
                            <tr>
                                <td>Score</td><td>{this.state.score}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </section>
        </div>);
    }

    componentDidMount(){
        document.onkeydown = this.keydown.bind(this);
        this.dropNew();
    }

    keydown(event){
        
        if(!this.enableKeyboard) return;
        this.enableKeyboard = false;
        switch(event.keyCode){
            case 0x25:
            case 0x27:
            case 0x26:
            case 0x28:
                break;
            case 0x20:
                if(this.timer_input){
                    window.clearTimeout(this.timer_input);
                    this.timer_input = null;
                }
                break;
            default:
                this.enableKeyboard = true;
                return;
        }

        switch(event.keyCode){
            case 0x25: //left
                this.moveActiveLeft();
                break;
            case 0x27: // right
                this.moveActiveRight();
                break;
            case 0x20: // speed up
                let r = this.moveActiveDown();
                if(r == null){
                    this.gameover();
                }else if(r === false){
                    this.merge(this.state.active);
                    this.state.score += this.clear();
                    this.state.total++;
                    this.dropNew();
                }
                break;
            case 0x26: // up
                this.state.active.turn(false);
                if(Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(true);
                }
                break;
            case 0x28: // down
                this.state.active.turn(true);
                if(Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(false);
                }
                break;
        }

        this.setState({
            data:this.state.data,
            active: this.state.active,
            total: this.state.total,
            score: this.state.score
        });
        if(this.timer_input == null){
            this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);
        }
        this.enableKeyboard = true;
    }

    moveActiveLeft(){ 
        if(this.state.active.col>0){
            this.state.active.col--;
            if(Game.testCollsion(this.state.data, this.state.active)){
                this.state.active.col++;
                return false;
            }
            return true;
        } 
        return false;
    }

    moveActiveRight(){
        if(this.state.active.col+this.state.active.width() < this.cols){
            this.state.active.col++;
            if(Game.testCollsion(this.state.data, this.state.active)){
                this.state.active.col--;
                return false;
            }
            return true;
        } 
        return false;
    }

    moveActiveDown(){
        let bottom = this.state.active.row + this.state.active.height();

        if(bottom < this.rows){
            this.state.active.row++;

            if(Game.testCollsion(this.state.data, this.state.active)){
                this.state.active.row--;
                if(this.state.active.row ==0 ){
                    return this.gameover();
                }
                return false;
            }
            return true;
        }else{
            return false;
        }
        
    }

    autoDrop(){
        this.keydown({
            keyCode: 0x20
        });
    }

    dropNew(){

        let next = this.setPreviewPosition(Tetris.random());
        let active = this.state.next?this.setNewTertrisPosition(this.state.next):this.setNewTertrisPosition(Tetris.random());

        this.setState({
            active: active,
            next: next
        });

        this.refs.preview.setState({
            active:next
        });

        this.refs.main.setState({
            data:this.state.data,
            active: active
        });

        this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);
    }

    isFullLine(line){
        for(let i=0; i<this.cols; i++){
            if(this.state.data[line][i] == null) return false;
        }
        return true;
    }

    clearLine(line){

        for(let i=line; i > 0; i--){
            for(let j = 0; j<this.cols; j++){
                this.state.data[i][j] = this.state.data[i-1][j];
            }
        }

        this.state.data[0].fill(null);
    }

    clear(){
        let count = 0;
        for(let i=0; i<this.state.active.height(); i++){
            if(this.isFullLine(i+this.state.active.row)){
                count++;
                this.clearLine(i+this.state.active.row);
            }
        }
        return count;
    }

    merge(tetris){
        for(let i=0; i<tetris.height(); i++){
            for(let j=0; j<tetris.width(); j++){
                if(this.state.data[i+tetris.row][tetris.col+j] == null) this.state.data[i+tetris.row][tetris.col+j] = tetris.getTile(i, j);
            }
        }
    }

    static testCollsion(matrix, tetris){
        for(let row = 0; row < tetris.height(); row++){
            for(let col = 0; col < tetris.width(); col++){
                if( (tetris.row + row > matrix.length ) || (tetris.col + col > matrix[0].length) || (matrix[tetris.row + row][tetris.col + col] !== null && tetris.getTile( row, col) !== null)){
                    return true;
                }
            }
        }
        return false;
    }

    gameover(){
        // window.alert('game over');
    }
}

let game = ReactDOM.render(<Game />, document.body);

