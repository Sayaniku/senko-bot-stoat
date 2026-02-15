class SympactEmbedBuilder {
    constructor() {
        this.embed = {
            title: null,
            url: null,
            description: null,
            color: null,
            thumbnail: null,
            image: null,
            author: null,
            footer: null,
            fields: [],
        };
    }

    setTitle(title) {
        this.embed.title = title;
        return this;
    }

    setDescription(description) {
        this.embed.description = description;
        return this;
    }

    setUrl(url) {
        this.embed.url = url;
        return this;
    }

    setColor(color) {
        this.embed.colour = color;
        return this;
    }

    // Thumbnail is currently not supported and deprecated!!!
    setThumbnail(thumbnail) {
        this.embed.thumbnail = thumbnail;
        return this;
    }

    // setImage is currently not supported and deprecated!!!
    setImage(image) {
        this.embed.image = image;
        return this;
    }

    setAuthor(name, icon_url, url) {
        this.embed.author = { name, icon_url, url };
        return this;
    }

    setFooter(text, icon_url) {
        this.embed.footer = { text, icon_url };
        return this;
    }

    addField(name, value, inline = false) {
        this.embed.fields.push({ name, value, inline });
        return this;
    }

    build() {
        // Créer l'embed final en ne gardant que les propriétés non-null
        const finalEmbed = {
            type: "Text"  // Type obligatoire pour Revolt
        };

        // Ajouter seulement les propriétés définies
        if (this.embed.title) finalEmbed.title = this.embed.title;
        if (this.embed.url) finalEmbed.url = this.embed.url;
        if (this.embed.description) finalEmbed.description = this.embed.description;
        if (this.embed.colour) finalEmbed.colour = this.embed.colour;
        if (this.embed.author) finalEmbed.author = this.embed.author;
        if (this.embed.footer) finalEmbed.footer = this.embed.footer;

        // Note: thumbnail, image et fields ne sont pas supportés par Revolt dans les Text embeds
        // Ils sont ignorés ici pour éviter les erreurs 422

        return finalEmbed;
    }

    /**
     * Return the embed object when converted to string
     */
    toString() {
        return JSON.stringify(this.embed);
    }

    /**
     * Return the embed object when coerced to JSON
     */
    toJSON() {
        return this.embed;
    }
}

module.exports = SympactEmbedBuilder;