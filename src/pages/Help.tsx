import type { MouseEvent, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import type { MessageId } from '../i18n/messages';
import { Page } from './Page';

const choices: MessageId[] = [
  'help.place',
  'help.direction',
  'help.duration',
  'help.anchor',
  'help.anchorPlace',
];

const questions: MessageId[] = [
  'help.question1',
  'help.question2',
  'help.question3',
  'help.question4',
  'help.question5',
];

const bold = { b: (chunks: ReactNode[]) => <strong>{chunks}</strong> };

interface HelpProps {
  onOpen: (hash: string) => void;
  onClose: () => void;
}

/**
 * A guide to the sentence: what each underlined word does. It ends with
 * the way to About and Privacy.
 */
export function Help({ onOpen, onClose }: HelpProps) {
  const intl = useIntl();
  const text = (id: MessageId) => intl.formatMessage({ id });
  const linkTo = (hash: string) => (chunks: ReactNode[]) => (
    <a
      href={hash}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onOpen(hash);
      }}
    >
      {chunks}
    </a>
  );
  return (
    <Page title={text('help.title')} onClose={onClose}>
      <p>{text('help.intro')}</p>
      <h2>{text('help.choicesTitle')}</h2>
      <ul>
        {choices.map((id) => (
          <li key={id}>{intl.formatMessage({ id }, bold)}</li>
        ))}
      </ul>
      <h2>{text('help.questionsTitle')}</h2>
      <ul>
        {questions.map((id) => (
          <li key={id}>{text(id)}</li>
        ))}
      </ul>
      <p>{text('help.clocks')}</p>
      <p>{text('help.offline')}</p>
      <p>
        {intl.formatMessage(
          { id: 'help.more' },
          { about: linkTo('#about'), privacy: linkTo('#privacy') },
        )}
      </p>
    </Page>
  );
}
