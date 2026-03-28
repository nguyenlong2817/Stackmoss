# Open-Source Research Baseline (2026)

As of 2026-03-28, these repositories/docs are used as primary external references for skill and agent design patterns.

## Direct Sources

1. Anthropic Claude Code SDK and docs  
   https://docs.anthropic.com/en/docs/claude-code/sdk

2. `obra/superpowers` (Claude Code superpowers core skills library)  
   https://github.com/obra/superpowers

3. `VRSEN/agency-swarm` (multi-agent orchestration; useful as closest match when "agency-agent" is requested)  
   https://github.com/VRSEN/agency-swarm

4. OpenAI Agents SDK (official docs)  
   https://platform.openai.com/docs/guides/agents

5. `microsoft/autogen`  
   https://github.com/microsoft/autogen

6. `langchain-ai/langgraph`  
   https://github.com/langchain-ai/langgraph

7. `crewAIInc/crewAI`  
   https://github.com/crewAIInc/crewAI

8. Model Context Protocol  
   https://github.com/modelcontextprotocol

## Portable Patterns Extracted

- Progressive disclosure over monolithic prompts.
- Strong trigger descriptions in metadata.
- Separation of core instructions vs references vs executable tooling.
- Explicit validation and failure evidence before "done".
- Governance loop with versioning, ownership, and cutoff refresh.

## Notes

- Exact repo named `agency-agent` was not reliably discoverable in primary GitHub results at the time of this baseline; `agency-swarm` is used as the closest operational reference.

