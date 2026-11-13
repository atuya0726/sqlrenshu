// PostgreSQL DATE (1082) and TIMESTAMP WITHOUT TIME ZONE (1114).
// Keep the original text so display and grading preserve the time and microseconds.
export const dateTimeParsers = {
  1082: (value: string) => value,
  1114: (value: string) => value,
};
