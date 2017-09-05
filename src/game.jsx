import React from 'react';
import Grid,{Tile, Tetris, buildMatrix} from './Grid';
import AI from './Ai';
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
        this.useAI = props.aiSeed!=null;
        this.interval_ai = props.aiInterval || 200;
        let aiSeed = props.aiSeed || {
            alpha:0.14454541761156853, 
            beta:-0.06266904571086948, 
            gama:-0.13412844849297312, 
            delta:-0.025127285656600856
        };
        
        this.ai = new AI(aiSeed.alpha, aiSeed.beta, aiSeed.gama, aiSeed.delta);
        if(props.aiSeed) this.ai.seed = props.aiSeed;
        
        this.aiActions = [];
        this.status = 0;  // 0: pause, 1: running, -1: game over
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
                            <tr>
                                <td><input type="radio" disabled={this.props.disableMode} checked={!this.useAI} value="false" onChange={(e)=>{e.target.blur();this.automation(e.target.value==="true")}} />人工控制</td><td><input type="radio" disabled={this.props.disableMode} value="true" checked={this.useAI}  onChange={(e)=>{e.target.blur();this.automation(e.target.value==="true")}} />AI控制</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section className="links">
                    <ul>
                        <li className={window.location.pathname.endsWith("/")||window.location.pathname.endsWith("/index.html")?"selected":""}><a href="index.html">Tetris</a></li>
                        <li className={window.location.pathname.endsWith("/test.html")?"selected":""}><a href="test.html">单元测试</a></li>
                        <li className={window.location.pathname.endsWith("/evolution.html")?"selected":""}><a href="evolution.html">AI训练</a></li>
                    </ul>
                </section>
                <section>
                    <p>操作说明:空格键加速，方向键左、右控制平移动，上下键控制变形</p>
                    <p>训练模式下不能切换操作模式，全程AI控制</p>
                    <p>Github地址: <a href="https://github.com/hoyt-tian/tetirs" target="_blank">https://github.com/hoyt-tian/tetirs</a></p>
                    <p>更多说明: <a href="http://www.hoyt-tian.com/tag/tetris/" target="_blank">http://www.hoyt-tian.com/tag/tetris</a></p>
                </section>
            </section>
        </div>);
    }

    componentDidMount(){
        document.onkeydown = this.keydown.bind(this);
        this.status = 1;
        this.dropNew();
    }

    doAction(keyCode){
        let r = null;
        switch(keyCode){
            case 0x25: //left
                this.moveActiveLeft();
                break;
            case 0x27: // right
                this.moveActiveRight();
                break;
            case 0x20: // speed up
                r = this.moveActiveDown();
                if(r == null){
                    return this.gameover();
                }else if(r === false){
                    this.merge(this.state.active);
                    this.state.score += this.clear();
                    this.state.total++;
                    this.dropNew();
                }else if(r && this.useAI){
                    this.setState({
                        data:this.state.data,
                        active: this.state.active,
                        total: this.state.total,
                        score: this.state.score
                    });
                    this.refs.main.setState({
                        data: this.state.data,
                        active: this.state.active
                    });
                    this.refs.preview.setState({
                        active: this.state.next
                    });
                    window.setTimeout( this.aiStep.bind(this), this.interval_ai);
                    return;
                }
                break;
            case 0x26: // up
                r = this.state.active.turn(false, this.rows, this.cols);
                if(r && Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(true, this.rows, this.cols);
                }
                break;
            case 0x28: // down
                r = this.state.active.turn(true, this.rows, this.cols);
                if(r && Game.testCollsion(this.state.data, this.state.active)){
                    this.state.active.turn(false, this.rows, this.cols);
                }
                break;
        }

        this.setState({
            data:this.state.data,
            active: this.state.active,
            total: this.state.total,
            score: this.state.score
        });
        this.refs.main.setState({
            data: this.state.data,
            active: this.state.active
        });
        this.refs.preview.setState({
            active: this.state.next
        });
    }

    keydown(event){
        if(!this.enableKeyboard || this.useAI) return;
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

        this.doAction(event.keyCode);
        this.enableKeyboard = true;
        if(this.timer_input == null) this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);

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
                if( Game.testCollsion(this.state.data, this.state.active) ){
                    return null;
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
        if(this.status <= 0){
            return;
        }
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

        
        if(this.useAI){
            if(this.timer_ai==null){
                this.timer_ai = window.setTimeout(this.aiStep.bind(this), this.interval_ai);
            }
        }else{
            if(this.timer_input == null){
                this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);
            } 
        }

        
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
            if(AI.isFullLine(this.state.data, i+this.state.active.row, this.cols)){
                count++;
                this.clearLine(i+this.state.active.row);
            }
        }
        return count;
    }

    merge(tetris){
        if(tetris.height()+tetris.row > this.state.data.length){
            return;
        }
        for(let i=0; i<tetris.height(); i++){
            for(let j=0; j<tetris.width(); j++){
                if(this.state.data[i+tetris.row][tetris.col+j] == null) this.state.data[i+tetris.row][tetris.col+j] = tetris.getTile(i, j);
            }
        }
    }

    static testCollsion(matrix, tetris){
        for(let row = 0; row < tetris.height(); row++){
            for(let col = 0; col < tetris.width(); col++){
                if( (tetris.row + row >= matrix.length ) || (tetris.col + col >= matrix[0].length) || (matrix[tetris.row + row][tetris.col + col] !== null && tetris.getTile( row, col) !== null)){
                    return true;
                }
            }
        }
        return false;
    }

    cleanUp(){
        this.status = -1;
        this.state = {
            total:0,
            score: 0,
            data: buildMatrix(this.rows, this.cols, null),
            next:null,
            active:null
        };
    }

    gameover(){
        if(this.timer_ai) window.clearTimeout(this.timer_ai);
        if(this.timer_input) window.clearTimeout(this.timer_input);
        this.timer_ai = this.timer_input = null;
        let state = this.state;
        this.cleanUp();
        if(this.props.onGameOver){
            this.props.onGameOver.call(this, state);
        }
    }

    aiStep(){
        if(this.timer_ai) window.clearTimeout(this.timer_ai);
        this.timer_ai = null;
        if(this.aiActions.length===0){
            this.aiActions = this.ai.think(this);
        }

        let step = this.aiActions.shift();
        if(step && step.code){
            this.doAction(step.code);
        }
        

        if(this.aiActions.length > 0){
            this.timer_ai = window.setTimeout(this.aiStep.bind(this), this.interval_ai);
        }else{
            this.doAction(0x20);
        }
        
    }

    automation(status){
       this.useAI = status;
       this.enableKeyboard = !status;
       if(status){
            if(this.timer_input){
                window.clearTimeout(this.timer_input);
                this.timer_input = null;
            }
            this.aiStep();
       }else{
           if(this.timer_ai){
               window.clearTimeout(this.timer_ai);
               this.timer_ai = 0;
           }
           this.autoDrop();
       }
    }

}

export default Game;


