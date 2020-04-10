import React, { useState } from 'react';

import styled, { css } from 'styled-components';

import catalog from './data';

function App() {
  const [selection, setSelection] = useState([] as number[]);

  const selectItem = (itemIndex: number, variantIndex: number) => {
    return () => {
      const newSelection = [...selection];
      newSelection[itemIndex] = variantIndex;
      setSelection(newSelection);
    };
  };
  return (
    <MainDiv>
      {catalog.map((item, itemIndex) => {
        const remakes: string[] = [];
        for(let x = 0; x < item.remakes; x++) {
          remakes.push(`${item.id}_remake_${x}_0`);
        }
        return <ItemBox key={item.id}>
          <div>{item.name}</div>
          {remakes.map((img, variantIndex) => {
            return <ItemVariantBox
              onClick={selectItem(itemIndex, variantIndex)}
              key={img}
              active={selection[itemIndex] === variantIndex}
            >
              <img
                src={`/img/${img}.png`}
                alt={img}
              />
            </ItemVariantBox>
          })}
        </ItemBox>;
      })}
    </MainDiv>
  );
}

const MainDiv = styled.div`
  color: #eee;
  padding: 16px;
`;

const ItemBox = styled.div`
  display: inline-block;
  padding: 24px;
  background: #111;
  margin: 8px;
  border-radius: 8px;
`;

interface ItemVariantBoxProps {
  active?: boolean
}
const ItemVariantBox = styled.div<ItemVariantBoxProps>`
  display: inline-block;
  padding: 8px;
  transition: transform 0.2s;
  border-radius: 12px;
  cursor: pointer;

  ${({ active }) => active && css`
    background: rgba(255, 255, 255, 0.1);
  `}

  > img {
    width: 40px;
  }

  &:hover {
    transform: scale(1.5);
  }
`;

export default App;
