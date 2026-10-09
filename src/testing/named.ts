// jsdom's accessible-name calculation puts a space around each button in a
// heading ("here ?"), which browsers do not. Compare names without it.
export function named(text: string) {
  return (name: string) =>
    name.replace(/\s+/g, ' ').replace(/ ([?:,.])/g, '$1') === text;
}
