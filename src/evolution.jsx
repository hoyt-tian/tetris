import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.jsx';

class GA extends React.Component{

    static normalize(ge){
        let normal = Math.sqrt(ge.alpha*ge.alpha+ge.beta*ge.beta+ge.gama*ge.gama+ge.delta*ge.delta);
        if(normal === 0 ) normal = 1;
        ge.alpha = ge.alpha/normal;
        ge.beta = ge.beta/normal;
        ge.gama = ge.gama/normal;
        ge.delta = ge.delta/normal;
        return ge;
    }

    constructor(props){
        super(props);

        let capacity = props.capacity || 10;
        this.seeds = [];

        for(let a=-capacity; a<capacity; a++){
            for(let b = -capacity; b<capacity; b++){
                for(let c = -capacity; c<capacity; c++){
                    for(let d = -capacity; d<capacity; d++){
                        this.seeds.push(GA.normalize({
                            alpha:a,
                            beta: b,
                            gama: c,
                            delta: d,
                            fitness: 0
                        }));
                    }
                }
            }
        }
            
        this.state = {
            capacity:this.capacity,
            index:0,
            etime:0,
            max : {
                fitness:0
            }
        };
    }

    render(){
        return (<section>
            <table>
                <thead>
                    <tr><th>项</th><th>值</th></tr>
                </thead>
                <caption>训练详情</caption>
                <tbody>
                    <tr><td>当前种群大小</td><td>{this.seeds.length}</td></tr>
                    <tr><td>当前测试个体</td><td>{this.state.index}</td></tr>
                    <tr><td>进化次数</td><td>{this.state.etime}</td></tr>
                    <tr><td>最大fitness</td><td>{this.state.max.fitness}</td></tr>
                    <tr><td>alpha</td><td>{this.state.max.alpha}</td></tr>
                    <tr><td>beta</td><td>{this.state.max.beta}</td></tr>
                    <tr><td>gama</td><td>{this.state.max.gama}</td></tr>
                    <tr><td>delta</td><td>{this.state.max.delta}</td></tr>
                    <tr><td>初始种群大小</td><td>{this.capacity}</td></tr>
                </tbody>
            </table>
        </section>);
    }

    static crossOver(seed1, seed2){
        let newborn = {
            alpha: seed1.fitness * seed1.alpha + seed2.fitness * seed2.alpha,
            beta: seed1.fitness * seed1.beta + seed2.fitness * seed2.beta,
            gama: seed1.fitness * seed1.gama + seed2.fitness * seed2.gama,
            delta: seed1.fitness * seed.delta + seed2.fitness * seed2.delta
        };
        return GA.normalize(newborn);
    }

    mutate(seed){
        let d = Math.random() * 0.4 - 0.2;
        let r = parseInt(Math.random() * 4);
        switch(r){
            case 0:
                seed.alpha += d;
                break;
            case 1:
                seed.beta += d;
                break;
            case 2:
                seed.gama += d;
                break;
            case 3:
                seed.delta += d;
                break;
        }
        return normalize(seed);
    }

    evolution(){
        this.seeds.sort((a,b)=>{ return b.fitness - a.fitness;});

        if(this.state.max.fitness < this.seeds[0].fitness){
            this.setState({
                max:JSON.parse(JSON.stringify(this.seeds[0]))
            });
            console.log('New best find: ', JSON.stringify(this.state.max));
        }
        let capacity = parseInt(this.seeds.length*0.6);
        this.seeds.length = capacity;
        this.setState({capacity:capacity});
        if(capacity < 3){
            return false;
        }
        for(let i=this.seeds.length-1; i>=0; i--){
            let x = parseInt(Math.random()/10*this.seeds.length);
            this.seeds[i] = GA.crossOver(this.seeds[i], this.seeds[x]);
            if(Math.random() < 0.05){
                this.mutate(this.seeds[i]);
            }
        }
    }

    next(){
        let seed = this.seeds[this.state.index++];
        if(this.state.index == this.seeds.length){
            this.state.etime++;
            this.setState({
                index: 0,
                etime: this.state.etime
            })
            if(this.evolution() === false){
                return false;
            }
        }else{
            this.setState({index: this.state.index});
        }
        return seed;
    }

}


let GACallback = (ga)=>{
    return function(state){
        if(this.ai.seed){
            this.ai.seed.fitness = state.total;
            if(this.ai.seed.fitness > ga.state.max.fitness){
                ga.setState({
                    max: this.ai.seed
                });
            }
        }
        let seed = ga.next();

        if(seed === false){
            console.log('trainning finish');
            return;
        }
        this.ai.alpha = seed.alpha;
        this.ai.beta = seed.beta;
        this.ai.gama = seed.gama;
        this.ai.delta = seed.delta;
        this.ai.seed = seed;

        this.status = 1;
        this.dropNew();
    };
};

let ga = ReactDOM.render(<GA capacity={2} />, document.getElementById('Training'));

let game = ReactDOM.render(<Game disableMode={true} onGameOver = {GACallback(ga)} ai={true} />, 
    document.getElementById('GameContainer'));



