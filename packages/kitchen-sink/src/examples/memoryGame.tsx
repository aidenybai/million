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
        { id: 1, img: "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg", stat: "" },
        { id: 11, img: "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg", stat: "" },
        { id: 2, img: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg', stat: "" },
        { id: 12, img: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg', stat: "" },
        { id: 3, img: 'https://static.javatpoint.com/images/javascript/javascript_logo.png', stat: "" },
        { id: 13, img: 'https://static.javatpoint.com/images/javascript/javascript_logo.png', stat: "" },
        { id: 4, img: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg', stat: "" },
        { id: 14, img: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg', stat: "" },
        { id: 5, img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", stat: "" },
        { id: 15, img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", stat: "" },
        { id: 6, img: "https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg", stat: "" },
        { id: 16, img: "https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg", stat: "" },
        { id: 7, img: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg", stat: "" },
        { id: 17, img: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg", stat: "" },
        { id: 8, img: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg", stat: "" },
        { id: 18, img: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg", stat: "" }
    ].sort(() => Math.random() - 0.5))

    const [prev, setPrev] = useState(-1);
    const [moves, setMoves] = useState(0);
    const [hmoves, setHmoves] = useState(0);
    const [correct, setcorrect] = useState(0);
    const [makingMove, setMakingMove] = useState(false);
    const [restart, setRestart] = useState(false);

    const check = (current : number)=>{
        setMakingMove(true);
        if((items[current].id == items[prev].id+10) || (items[current].id == items[prev].id-10)){
            if((correct==14) && (moves<hmoves || hmoves==0)) setHmoves(moves+1);
            items[current].stat = "correct"
            items[prev].stat = "correct"
            setcorrect(pre=>pre+2);
            setItems([...items])
            setPrev(-1)
            setMakingMove(false);
        }else{
            items[current].stat = "wrong"
            items[prev].stat = "wrong"
            setItems([...items])
            setTimeout(() => {
                items[current].stat = ""
                items[prev].stat = ""
                setItems([...items])
                setPrev(-1)
                setMakingMove(false);
            }, 1000)
        }
    }

    const handleClick = (id: number)=>{
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
        setRestart(true);
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
        setTimeout(()=>{setRestart(false);},500)
    }

    return (restart)?(<></>):((correct==16)?(
        <div className="memory__details_result">
            <h3>Your Score: {moves}</h3>
            <h3>HighScore: {(hmoves==0)?"none":hmoves}</h3>
            {(hmoves==moves)&&(<h3 className="memory__hscore">High Score! 🥳🥳</h3>)}
            <button onClick={restartGame}>Restart</button>
        </div>
    ):(
        <>
            <div className="memory__details">
                <h3>Moves: {moves}</h3>
                <h3>HighScore: {hmoves}</h3>
                <button onClick={restartGame}>Restart</button>
            </div>
            <div className="memory__container">
                { items.map((item, index) => (
                    <Card key={index} item={item} id={index} handleClick={(makingMove)?()=>{}:((item.stat=="correct" || item.stat=="active")?()=>{}:handleClick)} />
                    )) }
            </div>
        </>
    ))
}

export default Cards