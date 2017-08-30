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

        this.seeds = [];

        if(props.capacity){
            this.seeds.length = props.capacity;

            for(let i=0; i<this.seeds.length; i++){
                this.seeds[i] = {
                    alpha: Math.random()*0.4 - 0.2,
                    beta: Math.random()*0.4 - 0.2,
                    gama: Math.random()*0.4 - 0.2,
                    delta: Math.random()*0.4 - 0.2,
                    fitness: Number.NEGATIVE_INFINITY
                };
            }
        }else{
            let alpha = props.a || 2;
            let beta = props.b || 2;
            let gama = props.c || 2;
            let delta = props.d || 2;

            for(let a=-alpha; a<alpha; a++){
                for(let b = -beta; b<beta; b++){
                    for(let c = -gama; c<gama; c++){
                        for(let d = -delta; d<delta; d++){
                            this.seeds.push(GA.normalize({
                                alpha:a,
                                beta: b,
                                gama: c,
                                delta: d,
                                fitness: Number.NEGATIVE_INFINITY
                            }));
                        }
                    }
                }
            }
        }
        
            
        this.state = {
            capacity:this.seeds.length,
            index:0,
            etime:0,
            current:this.seeds[0],
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
                </tbody>
                <tbody>
                    <tr><td>当前alpha</td><td>{this.state.current.alpha}</td></tr>
                    <tr><td>当前beta</td><td>{this.state.current.beta}</td></tr>
                    <tr><td>当前gama</td><td>{this.state.current.gama}</td></tr>
                    <tr><td>当前delta</td><td>{this.state.current.delta}</td></tr>
                </tbody>
            </table>
        </section>);
    }

    static crossOver(seed1, seed2){
        let a1 = seed1.fitness/(seed1.fitness + seed2.fitness);
        let a2 = seed2.fitness/(seed1.fitness + seed2.fitness);
        let newborn = {
            alpha: a1 * seed1.alpha + a2 * seed2.alpha,
            beta: a1 * seed1.beta + a2 * seed2.beta,
            gama: a1 * seed1.gama + a2 * seed2.gama,
            delta: a1 * seed1.delta + a2 * seed2.delta
        };
        return newborn;
    }

    mutate(seed){
        let d = Math.random() - 0.5;
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
        return seed;
    }

    evolution(){
        this.seeds.sort((a,b)=>{ return b.fitness - a.fitness;});

        if(this.state.max.fitness < this.seeds[0].fitness){
            this.setState({
                max:JSON.parse(JSON.stringify(this.seeds[0]))
            });
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
                current:seed,
                index: 0,
                etime: this.state.etime
            })
            if(this.evolution() === false){
                return false;
            }
        }else{
            this.setState({index: this.state.index, current:seed});
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

let ga = ReactDOM.render(<GA capacity={1000} />, document.getElementById('Training'));

let game = ReactDOM.render(<Game  disableMode={true} onGameOver = {GACallback(ga)} aiSeed={ga.next()} aiInterval={10} />, 
    document.getElementById('GameContainer'));



