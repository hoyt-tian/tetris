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
        // let data = random(20, 15);
        // this.refs.main.setState({data:data});

        let active = this.setNewTertrisPosition(Tetris.random());
        let next = this.setPreviewPosition(Tetris.random());

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
        document.onkeydown = this.keydown.bind(this);
    }

    keydown(event){
        switch(event.keyCode){
            case 0x25: //left
                this.moveActiveLeft();
                break;
            case 0x27: // right
                this.state.active.col++;
                break;
            case 0x28: // down
                this.state.active.row++;
                break;
            default:
                return;
        }
        this.setState({
            data:this.state.data,
            active: this.state.active
        });
    }

    moveActiveLeft(){
        if(this.state.active.col>0){
            this.state.active.col--;
            return true;
        } 
        return false;
    }

    moveActiveRight(){
        if(this.state.active.col<=this.cols-2){
            this.state.active.col++;
            return true;
        } 
        return false;
    }

    moveActiveDown(){
        let bottom = this.state.active.row + this.state.active.height() + 1;

        if(bottom < this.rows){
            
            for(let i=0; i < this.state.active.width(); i++){
                if( this.state.data[bottom][this.state.active.col + i] != "" ){
                    return false;
                }
            }

            this.state.active.row++;
            return true;
        }else{
            return false;
        }
        
    }

    

    autoDrop(){
        let r = this.moveActiveDown();

        if( r ){
            this.refs.main.setState({
                data:this.state.data,
                active: this.state.active
            });
        }else{
            // 
        }
        
        this.timer_input = window.setTimeout(this.autoDrop.bind(this), this.interval_input);
    }

}

let game = ReactDOM.render(<Game />, document.body);

