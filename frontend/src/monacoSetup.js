
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Use the installed Monaco package instead of the default CDN.
loader.config({ monaco });
