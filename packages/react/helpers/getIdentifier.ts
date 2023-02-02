function getIdentifier(resourceSpec: any, key: string) {
    let identifier = "";
    resourceSpec.attributes.forEach((element: any) => {
        if (element.resolved_identifier === key) {
            identifier = element.identifier;
        }
    });
    return identifier;
}

export default getIdentifier;
