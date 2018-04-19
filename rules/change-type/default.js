function execute(node)
{
    /*
     * set properties required by cxindex:resource type
     * then change this node's type to cxindex:resource
     */
    logger.info("change-type rule script fired");
    logger.info("document title: " + node.data.title);
    logger.info("current type: " + node.data._type);
    logger.info("current path: " + node.data.paths);

    var title = node.data.title || "";
    if (!node.data.title) {
        // no title so can't determine type
        return;
    }

    if (node.data._type !== "n:node") {
        // only check untyped files
        return;
    }

    title = title.toLowerCase();
    var ResourceType = "media";
    if ((/\.(gif|jpg|jpeg|tiff|png)$/).test(title)) {
        logger.info("image type");
        ResourceType = "image";
    } else if ((/\.(doc|docx)$/).test(title)) {
        logger.info("ms-doc type");
        ResourceType = "ms-doc";
    } else if ((/\.(doc|docx)$/).test(title)) {
        logger.info("pdf type");
        ResourceType = "pdf";
    }

    node.data.ResourceType = ResourceType;
    node.data.ResourceTitle = title;
    node.data.ResourceDescription = "";
    node.data.ResourceURL = "";
    node.data.ResourcePublishingDate = "";

    node.save();
}