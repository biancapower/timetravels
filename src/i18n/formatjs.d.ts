import type { MessageId } from './messages';

// Makes react-intl reject message ids that are not in the catalogue.
declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: MessageId;
    }
  }
}
