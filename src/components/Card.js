import React from 'react';

export const Card = ({ card, visible, isEmpty, clickHandler }) => {
  const className = isEmpty ? 'invisible card' : visible ? 'visible card' : 'card';
  const style = visible || isEmpty ? { backgroundImage: `url(${card.photoUrl})` } : {};

  return (
    <div style={style} className={className} onClick={isEmpty || visible ? null : clickHandler}>
      {!visible && !isEmpty && <small>EyeEm</small>}
    </div>
  );
};
