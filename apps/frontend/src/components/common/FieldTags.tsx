import * as React from 'react'
import {FieldArray, FieldArrayRenderProps} from 'formik'
import {Block} from 'baseui/block'
import {Input} from "baseui/input";
import Button from "./Button";
import {SHAPE} from "baseui/button";
import {Plus} from "baseui/icon";
import {renderTagList} from "./TagList";

const FieldTags = () => {

  const [tag, setTag] = React.useState("");
  const tagsRef = React.useRef<HTMLInputElement>(null);

  const onAddKeyword = (arrayHelpers: FieldArrayRenderProps) => {
    if (!tag.trim()) {
      setTag("")
      return
    }
    arrayHelpers.push(tag)
    setTag("")
    if (tagsRef && tagsRef.current) {
      tagsRef.current.focus()
    }
  }

  return (
    <FieldArray
      name="tags"
      render={arrayHelpers => (
        <Block width={"100%"}>
          <Block>
            <Input
              type="text"
              placeholder={"Tagger"}
              value={tag}
              onChange={event =>
                setTag(
                  event.currentTarget
                    .value
                )
              }
              onBlur={() => onAddKeyword(arrayHelpers)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddKeyword(arrayHelpers)
              }}
              inputRef={tagsRef}
              overrides={{
                After: () => (
                  <Button
                    type="button"
                    shape={SHAPE.square}
                  >
                    <Plus/>
                  </Button>
                )
              }}
            />
          </Block>
          <Block>
            {renderTagList(arrayHelpers.form.values.tags, (index: number) => arrayHelpers.remove(index))}
          </Block>
        </Block>
      )}
    />
  )
}

export default FieldTags
