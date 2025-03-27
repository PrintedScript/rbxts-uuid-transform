import ts, { factory } from "typescript";
import {v4 as uuidv4} from 'uuid';

function hasUUIDTag(statement: ts.EnumDeclaration) : boolean {
    const JSDocTags = ts.getJSDocTags(statement);
    for ( const tag of JSDocTags ) {
        if (tag.tagName.text === "uuid") { return true; }
    }
    return false;
}

function transformStatement( statement: ts.Statement ) : ts.Statement {
    if ( 
        !ts.isEnumDeclaration(statement) ||
        !(statement.modifiers?.find((modifier) => modifier.kind === ts.SyntaxKind.ConstKeyword))
    ) { return statement; }
    if ( !hasUUIDTag(statement) ) { return statement; }

    return factory.updateEnumDeclaration(
        statement,
        statement.modifiers,
        statement.name,
        statement.members.map((member) => {
            return factory.updateEnumMember(
                member,
                member.name,
                factory.createStringLiteral(
                    uuidv4()
                )
            )
        })
    );
}

export default function transform(program: ts.Program) {
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const newStatements = new Array<ts.Statement>();
            sourceFile.statements.forEach((statement) => {
                const transformedStatement = transformStatement(statement);
                newStatements.push(transformedStatement);
            });
            return factory.updateSourceFile(
                sourceFile,
                newStatements,
                sourceFile.isDeclarationFile,
                sourceFile.referencedFiles,
                sourceFile.typeReferenceDirectives,
                sourceFile.hasNoDefaultLib,
                sourceFile.libReferenceDirectives
            );
        };
    };
};