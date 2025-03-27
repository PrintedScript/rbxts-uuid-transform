import ts, { factory } from "typescript";
import {v4 as uuidv4} from 'uuid';

interface TransformerConfiguration {
    verbose: boolean;
}

const defaultConfiguration: TransformerConfiguration = {
    verbose: false
}

function hasUUIDTag(statement: ts.EnumDeclaration) : boolean {
    const JSDocTags = ts.getJSDocTags(statement);
    for ( const tag of JSDocTags ) {
        if (tag.tagName.text === "uuid") { return true; }
    }
    return false;
}

function transformStatement( statement: ts.Statement, configuration: TransformerConfiguration ) : ts.Statement {
    if ( 
        !ts.isEnumDeclaration(statement) ||
        !(statement.modifiers?.find((modifier) => modifier.kind === ts.SyntaxKind.ConstKeyword))
    ) { return statement; }
    if ( !hasUUIDTag(statement) ) { return statement; }

    if ( configuration.verbose ) { console.log(`Transforming ${statement.name.getText()}`); }
    return factory.updateEnumDeclaration(
        statement,
        statement.modifiers,
        statement.name,
        statement.members.map((member) => {
            const generatedUUID = uuidv4();
            if ( configuration.verbose ) { console.log(`${statement.name.getText()}.${member.name.getText()} -> ${generatedUUID}`); };
            return factory.updateEnumMember(
                member,
                member.name,
                factory.createStringLiteral(
                    generatedUUID
                )
            )
        })
    );
}

export default function transform(program: ts.Program, configuration: TransformerConfiguration = defaultConfiguration) {
    configuration = { ...defaultConfiguration, ...configuration };
    return (ctx: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const newStatements = new Array<ts.Statement>();
            sourceFile.statements.forEach((statement) => {
                const transformedStatement = transformStatement(statement, configuration);
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