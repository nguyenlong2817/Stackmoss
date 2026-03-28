# Open-Source Research Baseline (2026-03-28)

This baseline is used to keep skill design patterns current and portable across runtimes.

## Primary References

1. local benchmark clone: `E:/skill-engineer/`
2. `obra/superpowers`  
   https://github.com/obra/superpowers
3. `VRSEN/agency-swarm`  
   https://github.com/VRSEN/agency-swarm
4. OpenAI Agents docs  
   https://platform.openai.com/docs/guides/agents
5. `microsoft/autogen`  
   https://github.com/microsoft/autogen
6. `langchain-ai/langgraph`  
   https://github.com/langchain-ai/langgraph
7. `crewAIInc/crewAI`  
   https://github.com/crewAIInc/crewAI
8. Model Context Protocol  
   https://github.com/modelcontextprotocol

## Patterns to Reuse

- progressive disclosure over monolithic instruction blocks
- explicit trigger semantics in metadata
- separation of core instructions, references, scripts, and templates
- eval loop with baseline comparison where useful
- mandatory validation evidence before claiming ready
- governance loop for iterative skill improvement

## Notes

- Avoid hardcoding one platform's UX assumptions into the core skill workflow.
- Keep only runtime adapters (paths/config) specific to the current target runtime.
