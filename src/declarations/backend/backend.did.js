export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getHighScores' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'submitScore' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
