import styled from 'styled-components';

import { customInput } from '~/renderer/mixins';

export const Input = styled.input`
  width: 200px;
  height: 32px;
  position: relative;;
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0px 8px;
  background-color: rgba(0, 0, 0, 0.08);
  color: #000;
  ${customInput()};

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
