import repl from 'node:repl';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Connection, Messages, Org } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-repl-plugin', 'repl');

export type ReplResult = {
  path: string;
};

export default class Repl extends SfCommand<ReplResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'n',
      required: false,
    }),
    'target-org': Flags.requiredOrg(),
  };

  public async run(): Promise<ReplResult> {
    const { flags } = await this.parse(Repl);
    const replServer = repl.start({ breakEvalOnSigint: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    replServer.setupHistory('.repl_history', (_err, _repl) => {});

    async function getConnection(username: string): Promise<Connection> {
      const org = await Org.create({ aliasOrUsername: username });
      return org.getConnection();
    }

    const context = {
      conn: await getConnection(flags['target-org'].getUsername() as string),
    };

    Object.assign(replServer.context, context);
    return {
      path: 'src/commands/repl.ts',
    };
  }
}
