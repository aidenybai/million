import React from 'react';
import {useState} from 'react'
import styled from 'styled-components';
import { block } from 'million/react';
import {marked} from 'marked'

export const ColumnFlex = styled.div`
  display: flex;
  flex-direction: column;
`;
export const RowFlex = styled.div`
  display: flex;
  flex-direction: row;
`;


type Editing={
    markdownContent: string;
}

const Preview=block(({markdownContent}:Editing)=>{
  const mardownFormattedContent = marked(markdownContent);
    return(
        <>
        <ColumnFlex
            id="preview"
            style={{
            flex: "1",
            padding: "16px",
            }}
        >
            <h2>Preview</h2>
            <div
            dangerouslySetInnerHTML={{__html: mardownFormattedContent}}
            >
            </div>
        </ColumnFlex>
      </>
    )
})

export default function MarkdownEditor() {
    const [markdownContent, setMarkdownContent] = useState<string>(`
    # H1
    ## H2
    ### H3
    #### H4
    ##### H5
    
    __bold__
    **bold**
    _italic_
    `);
    const handleChange=(e: React.ChangeEvent<HTMLTextAreaElement>) => {setMarkdownContent(e.target.value)}
  return( <div>
    <RowFlex
      style={{
        padding: "32px",
        paddingTop: "0px",
        height: "60vh",
        background:"black",
        color:"white",
        }}>
        <ColumnFlex
        style={{
            flex: "1",
            padding: "16px",
          }}>
        <h2>
        Editor
        </h2>
        <textarea style={{height:"50vh",borderRadius:"10px",border:"2px grey",color:"black",
        fontSize:"15px",padding:"20px"}}
          onChange={handleChange} value={markdownContent}
          />
          </ColumnFlex>
      <Preview markdownContent={markdownContent}/> 
    </RowFlex>
  </div>);
}
