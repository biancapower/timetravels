import type { ReactNode } from 'react';
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

/** A guide to the sentence: what each underlined word does. */
export function Help({ onClose }: { onClose: () => void }) {
  const intl = useIntl();
  const text = (id: MessageId) => intl.formatMessage({ id });
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
    </Page>
  );
}
