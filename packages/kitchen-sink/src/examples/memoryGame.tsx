import { useState } from 'react'
import { block } from 'million/react';
type IteamType = {
    id: number;
    img: string;
    stat: string;
}

type CardPrompt = {
    item: IteamType;
    id: number;
    handleClick: (id: number) => void;
}

const Card = block(({item, id, handleClick}: CardPrompt) => {
    const itemClass = item.stat ? " active " + item.stat : "";
    return (
        <div className={"memory__card" + itemClass} onClick={() => handleClick(id)}>
            <img src={item.img} alt="" />
        </div>
    )
})

const Cards = ()=>{
    const [items, setItems] = useState([
        { id: 1, img: '../assets/html.png', stat: "" },
        { id: 11, img: '../assets/html.png', stat: "" },
        { id: 2, img: '../assets/css.png', stat: "" },
        { id: 12, img: '../assets/css.png', stat: "" },
        { id: 3, img: '../assets/js.png', stat: "" },
        { id: 13, img: '../assets/js.png', stat: "" },
        { id: 4, img: '../assets/scss.png', stat: "" },
        { id: 14, img: '../assets/scss.png', stat: "" },
        { id: 5, img: '../assets/react.png', stat: "" },
        { id: 15, img: '../assets/react.png', stat: "" },
        { id: 6, img: '../assets/vue.png', stat: "" },
        { id: 16, img: '../assets/vue.png', stat: "" },
        { id: 7, img: '../assets/angular.png', stat: "" },
        { id: 17, img: '../assets/angular.png', stat: "" },
        { id: 8, img: '../assets/nodejs.png', stat: "" },
        { id: 18, img: '../assets/nodejs.png', stat: "" }
    ].sort(() => Math.random() - 0.5))

    const [prev, setPrev] = useState(-1);
    const [moves, setMoves] = useState(0);
    const [hmoves, setHmoves] = useState(0);
    const [correct, setcorrect] = useState(0);

    function check(current : number){
        if((items[current].id == items[prev].id+10) || (items[current].id == items[prev].id-10)){
            if((correct==14) && (moves<hmoves || hmoves==0)) setHmoves(moves+1);
            items[current].stat = "correct"
            items[prev].stat = "correct"
            setcorrect(pre=>pre+2);
            setItems([...items])
            setPrev(-1)
        }else{
            items[current].stat = "wrong"
            items[prev].stat = "wrong"
            setItems([...items])
            setTimeout(() => {
                items[current].stat = ""
                items[prev].stat = ""
                setItems([...items])
                setPrev(-1)
            }, 1000)
        }
    }

    function handleClick(id: number){
        setMoves(pre=>pre+1);
        if(prev === -1){
            items[id].stat = "active"
            setItems([...items])
            setPrev(id)
        }else{
            check(id)
        }
    }
    const restartGame =()=>{
        setItems((pre:IteamType[] ):IteamType[] => {
            let p: IteamType[] = [];
            for(let i=0;i<pre.length;i++){
                p.push(pre[i]);
                p[i].stat="";
            }        
            return p.sort(() => Math.random() - 0.5);
        });
        setMoves(0);
        setcorrect(0);
    }

    return (correct==16)?(
        <div className="memory__details_result">
            <h3>Your Score: {moves}</h3>
            <h3>HighScore: {(hmoves==0)?"none":hmoves}</h3>
            {(hmoves==moves)&&(<h3 className="memory__hscore">High Score! 🥳🥳</h3>)}
            <button onClick={restartGame}>Restart</button>
        </div>
    ) :(
        <>
            <div className="memory__details">
                <h3>Moves: {moves}</h3>
                <h3>HighScore: {hmoves}</h3>
            </div>
            <div className="memory__container">
                { items.map((item, index) => (
                    <Card key={index} item={item} id={index} handleClick={(item.stat=="correct" || item.stat=="active")?()=>{}:handleClick} />
                    )) }
            </div>
        </>
    )
}

export default Cards