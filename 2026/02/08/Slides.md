
# Bonus for miniCPU project

## Bonus Content
1. Implemented all RV32I instructions
2. Implemented all RV32M instructions

## RV32I

### R-type
- sll, srl, sra, xor, sltu

#### Implementation
Based on the basic instruction set, we update ALU module to support additional arithmetic operations, with control signals generated via funct3 and funct7(srl vs sra)


### I-type
- xori, sltiu(I1/IMM)
- lb, lh, lbu, lhu(I1/LOAD) 
- slli, srli, srai(I2)
- jalr(I1/JUMP)
#### Implementation
| Instr type | opcode | funct7 | 
|------|----|----|
| I1/Imm | 0010011 | null | 
| I1/LOAD | 0000011 | null | 
| I2 | 0010011 | 0000000/0100000(srai)|
| I1/JUMP | 1100111 | null |
#### I1/I2
Due to the differing immediate value extraction and expansion methods for I1 and I2 type instructions, these must be distinguished in the Main decoder. As both share the same opcode, funct3 is employed to differentiate between them.

#### I1-LOAD
As load-type instructions require processing of data output from DMEN, we have additionally constructed a dedicated data processor module. Within the Maindecoder, funct3 distinguishes between different load instructions, subsequently generating the LSrc control signal.  

#### I1/JUMP
To implement the jalr jump, expand the pcsrc signal to two bits.



### S-type
- sb, sh

#### Implementation
Similar to the load instruction, the store instruction requires processing of the data in rs2. We similarly construct an Sprocessor module, using funct3 within the Maindecoder to distinguish between different store instructions, thereby outputting the SSrc signal.


### B-type
- beq, blt, bltu, bge, bgeu

#### Implementation
Modify the ALU to output the less and lessu signals to the Main Decoder; the Main Decoder then combines these signals with other control signals to generate the Branch and Jump signals; finally, the Control Unit integrates these Branch/Jump signals to form the PCSrc signal.


### U-type
- lui, auipc

#### Implementation
There are only two U-type instructions: `lui` directly assigns the high-order immediate value to `rd`, while `auipc` adds the immediate value to the PC and reassigns the result to `pc`. These operations can be executed outside the ALU module, akin to the `jal` instruction. Consequently, we have extended the ResultMux by increasing the `ResultSrc` to a 3-bit signal to accommodate selection requirements. Simultaneously, we have expanded the Extend module to fulfil immediate value extension needs.


## RV32M

#### Instruction
- mul, mulh, mulsu, mulu, div, divu, rem, remu

#### Implementation
| Instr | opcode | funct3 | funct7|     
|------|----|----|----|
| mul | 0110011 | 000 | 0000001|
| mulh | 0110011| 001 | 0000001|
| mulsu | 0110011 | 010| 0000001|
| mulu | 0110011 | 011 | 0000001|
| div | 0110011 | 100 | 0000001|
| divu | 0110011 | 101 | 0000001|
| rem | 0110011 | 110 | 0000001|
| remu | 0110011 | 111 | 0000001|

#### R/M
The M-type instruction is essentially an R-type instruction, hence its opcode is identical to that of the R-type. To distinguish between the two, a funct7[0] filter is added within the main decoder: a value of 1 indicates an M-type instruction, while 0 denotes an R-type instruction. The ALUOp for M is 11, thereby significantly simplifying the circuitry within the ALU decoder.

Concurrently, we have updated the ALU module to support the computational demands of the M extension, and extended the ALUControl signal to 5 bits.