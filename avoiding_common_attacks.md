- Using Specific Compiler Pragma / YES (0.8.11)
- Pull Over Push (Prioritize receiving contract calls over making contract calls) /YES
- Use Modifiers Only for Validation  / YES
- Checks-Effects-Interactions (Avoiding state changes after external calls)
- Timestamp Dependence / YES
 => block.timestamp is meant to be used only as a timestamp and will be once an Oracle RNG is implemented.
- Tx.Origin Authentication / YES
  => Not in use in the Dapp. 