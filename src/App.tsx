import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import catalog from './data';
const defaultSelection = catalog.map(() => 0);
const codeInBinLength = catalog.reduce((c, n) => {
  const maxValue = n.remakes - 1;
  const maxInBin = maxValue.toString(2);
  return c + maxInBin.length;
}, 0);

function selectionToCode (selection: number[]) {
  const codeInBin = catalog.map((item, itemIndex) => {
    const maxValue = item.remakes - 1;
    const maxInBin = maxValue.toString(2);
    let actualValue = (selection[itemIndex]).toString(2);
    while (actualValue.length < maxInBin.length) {
      actualValue = '0' + actualValue;
    }
    return actualValue;
  }).join('');
  return parseInt(codeInBin, 2).toString(36);
}

function codeToSelection (code: string) {
  if (code === '0') {
    return defaultSelection;
  }
  let codeInBin = parseInt(code, 36).toString(2);
  while (codeInBin.length < codeInBinLength) {
    codeInBin = '0' + codeInBin;
  }
  const codeInBinArray = codeInBin.split('');
  const selection = [...catalog].reverse().map((item, itemIndex) => {
    const maxValue = item.remakes - 1;
    const maxInBin = maxValue.toString(2);
    let valueFromCode = '';
    while (valueFromCode.length < maxInBin.length && codeInBinArray.length >= 1) {
      valueFromCode = codeInBinArray.pop() + valueFromCode;
    }
    return parseInt(valueFromCode, 2);
  });
  return selection.reverse();
}

function App() {

  const location = useLocation();
  const history = useHistory();

  const [activeUser, setActiveUser] = useState(0);

  let defaultUsers = [{
    name: 'monique',
    selection: [...defaultSelection],
  }];

  const queryParts = location.search.substr(1).split('&').map(queryPart => {
    const keyValue = queryPart.split('=');
    return {
      key: keyValue[0],
      value: keyValue[1],
    };
  });
  const queryData = queryParts.find(qp => qp.key === 'data');
  if (queryData) {
    const userCodes = queryData.value.split(',');
    const importedUsers = userCodes.map(userCode => {
      const parts = userCode.split('-');
      return {
        name: parts[0],
        selection: codeToSelection(parts[1]),
      };
    })
    defaultUsers = importedUsers;
  }
  const [users, setUsers] = useState(defaultUsers);

  const userCode = users.map(user => {
    return `${user.name}-${selectionToCode(user.selection)}`;
  }).join(',');

  useEffect(() => {
    const newPath = `?data=${userCode}`;
    if (newPath !== location.search) {
      history.replace(newPath);
    }
  }, [userCode, history, location]);

  const selectItem = (itemIndex: number, variantIndex: number) => {
    return () => {
      // const newSelection = [...selection];
      // newSelection[itemIndex] = variantIndex;
      // setSelection(newSelection);
      const newUsers = [...users];
      newUsers[activeUser].selection[itemIndex] = variantIndex;
      setUsers(newUsers);
    };
  };

  const addNewUser = () => {
    setUsers([
      ...users,
      {
        name: `user_${users.length + 1}`,
        selection: [...defaultSelection],
      }
    ]);
  };

  const updateUserName = (userIndex: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const newUsers = [...users];
      newUsers[userIndex].name = e.currentTarget.value.replace(/\W/g, '_');
      setUsers(newUsers);
    };
  };

  const assignActiveUser = (userIndex: number) => {
    return () => {
      setActiveUser(userIndex);
    };
  };

  const removeUser = (userIndex: number) => {
    return () => {
      if (users.length < 2) {
        return;
      }
      const newUsers = [...users];
      newUsers.splice(userIndex, 1);
      setUsers(newUsers);
    };
  };

  return (
    <MainDiv>
      <Users>
        <div>
          <button onClick={addNewUser}>Add user</button>
        </div>
        <ul>
          {users.map((user, userIndex) => {
            return <li
              key={userIndex}
              style={userIndex === activeUser ? {
                background: '#555',
              } : {}}
            >
              <input
                value={user.name}
                onChange={updateUserName(userIndex)}
                onFocus={assignActiveUser(userIndex)}
              />
              <span onClick={removeUser(userIndex)}>remove</span>
            </li>;
          })}
        </ul>
      </Users>
      {catalog.map((item, itemIndex) => {
        const remakes: string[] = [];
        for(let x = 0; x < item.remakes; x++) {
          remakes.push(`${item.id}_remake_${x}_0`);
        }
        return <ItemBox key={item.id}>
          <div>{item.name}</div>
          {remakes.map((img, variantIndex) => {
            const usersWithThisVariant = users.filter(user => {
              return user.selection[itemIndex] === variantIndex;
            });
            return <ItemVariantBox
              onClick={selectItem(itemIndex, variantIndex)}
              key={img}
              active={users[activeUser].selection[itemIndex] === variantIndex}
            >
              <div><img
                src={`img/${img}.png`}
                alt={img}
              /></div>
              <div>
                {usersWithThisVariant.map(user => {
                  const userIndex = users.indexOf(user);
                  return <div
                    key={userIndex}
                    style={userIndex === activeUser ? {
                      textDecoration: 'underline',
                    } : {}}
                  >
                    {user.name}
                  </div>;
                })}
              </div>
            </ItemVariantBox>
          })}
        </ItemBox>;
      })}
    </MainDiv>
  );
}

const MainDiv = styled.div`
  background: #333;
  color: #eee;
  padding: 16px;
`;

const Users = styled.div`
  background: #111;
  margin: 8px;
  border-radius: 8px;

  button {
    margin: 4px;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    background: #444;
    color: #eee;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  ul {
    padding: 0;
    margin: 0;
  }

  li {
    list-style: none;
    margin: 4px;
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    > span {
      font-size: 10px;
      padding: 2px 4px;
      background: rgba(255, 255, 255, 0.2);
      margin-right: 4px;
      border-radius: 100px;
      vertical-align: middle;
      cursor: pointer;
      display: inline-block;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }

  input {
    background: none;
    border: none;
    color: #fff;
    padding: 4px 8px;
    text-align: center;
    cursor: pointer;
    vertical-align: middle;

    &:focus {
      outline: none;
    }
  }
`;

const ItemBox = styled.div`
  display: inline-block;
  padding: 8px;
  background: #111;
  margin: 8px;
  border-radius: 8px;
  user-select: none;
`;

interface ItemVariantBoxProps {
  active?: boolean
}
const ItemVariantBox = styled.div<ItemVariantBoxProps>`
  display: inline-block;
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  vertical-align: top;

  > div:first-child {
    text-align: center;

    img {
      width: 40px;
      transition: transform 0.2s;
    }
  }

  ${({ active }) => active && css`
    background: rgba(255, 255, 255, 0.1);
  `}

  &:hover img {
    transform: scale(1.5);
  }
`;

export default App;
