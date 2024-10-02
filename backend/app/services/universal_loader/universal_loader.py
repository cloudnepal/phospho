from typing import Optional
from app.services.universal_loader.llm_functions import (
    openai_converter,
    phospho_converter,
    user_assistant_converter,
)
from loguru import logger
import pandas as pd  # type: ignore


def converter_openai_phospho(df: pd.DataFrame) -> pd.DataFrame:
    tasks = []
    last_side = None
    last_session_id = None
    for i in range(df.shape[0]):
        row = df.iloc[i]
        if last_session_id != row["conversation_id"]:
            last_side = None
        if last_side is None and row["role"] == "assistant":
            tasks.append(
                {
                    "session_id": row["conversation_id"],
                    "created_at": row["created_at"],
                    "input": "(no input)",
                    "output": row["content"].strip(),
                    "conversation_id": row["conversation_id"],
                }
            )
        # What if multiple humans or multiple successive AI ?
        if last_side == "user" and row["role"] == "assistant":
            # Warning; Duplicate metadata
            tasks.append(
                {
                    "session_id": row["conversation_id"],
                    "created_at": row["created_at"],
                    "input": df.iloc[i - 1]["content"],
                    "output": row["content"],
                }
            )
        last_side = row["role"]
        last_session_id = row["conversation_id"]
    tasks_df = pd.DataFrame(tasks)

    return tasks_df


async def universal_loader(tasks_df: pd.DataFrame) -> Optional[pd.DataFrame]:
    """
    This function is a universal loader that takes a DataFrame as input and returns a Dataframe with the Phospho format.

    The Phospho format is defined as follows:
    - input: The input text. (required)
    - output: The output text. (optional)
    - created_at: The timestamp when the message was created. (optional)
    - task_id: A unique identifier for the task. (optional)
    - session_id: A unique identifier for the session. (optional)
    - user_id: A unique identifier for the user. (optional)
    - version_id: A unique identifier for the ChatBot version. (optional)
    """

    required_columns_phospho = ["input"]

    # required columns for the OpenAI format : content, role, created_at, conversation_id
    required_columns_openai = ["content", "role", "created_at", "conversation_id"]

    # Verify if the required columns are present
    missing_columns_phospho = set(required_columns_phospho) - set(
        list(tasks_df.columns)
    )
    logger.debug(f"Missing columns: {missing_columns_phospho}")

    if not missing_columns_phospho:
        return tasks_df

    missing_columns_openai = set(required_columns_openai) - set(list(tasks_df.columns))
    logger.debug(f"Missing columns: {missing_columns_openai}")

    if not missing_columns_openai:
        return converter_openai_phospho(tasks_df)

    conversion_mapping = await openai_converter(tasks_df)
    logger.debug(conversion_mapping)

    if (
        conversion_mapping.content is not None
        and conversion_mapping.role is not None
        and conversion_mapping.created_at is not None
        and conversion_mapping.conversation_id is not None
    ):
        tasks_df.rename(
            columns={
                conversion_mapping.content: "content",
                conversion_mapping.role: "role",
                conversion_mapping.created_at: "created_at",
                conversion_mapping.conversation_id: "conversation_id",
            },
            inplace=True,
        )

        if (
            "role" in tasks_df.columns
            and not tasks_df["role"].empty
            and "content" in tasks_df.columns
            and not tasks_df["content"].empty
            and "created_at" in tasks_df.columns
            and not tasks_df["created_at"].empty
            and "conversation_id" in tasks_df.columns
            and not tasks_df["conversation_id"].empty
        ):
            user_assistant_mapping = await user_assistant_converter(tasks_df)
            logger.debug(user_assistant_mapping)

            if (
                user_assistant_mapping.user is not None
                and user_assistant_mapping.assistant is not None
            ):
                # In the column role, I want to rename the equivalent of assistant by assistant and the equivalent to user by user

                tasks_df["role"] = tasks_df["role"].replace(
                    user_assistant_mapping.assistant, "assistant"
                )
                tasks_df["role"] = tasks_df["role"].replace(
                    user_assistant_mapping.user, "user"
                )

                return converter_openai_phospho(tasks_df)

    logger.debug("OpenAI format not recognized")

    phospho_mapping = await phospho_converter(tasks_df)

    logger.debug(f"phospho conversion_mapping: {conversion_mapping}")

    if phospho_mapping.input is None:
        return None

    columns_mapping = {
        "input": phospho_mapping.input,
    }

    if phospho_mapping.output is not None:
        columns_mapping["output"] = phospho_mapping.output

    if phospho_mapping.created_at is not None:
        columns_mapping["created_at"] = phospho_mapping.created_at

    if phospho_mapping.task_id is not None:
        columns_mapping["task_id"] = phospho_mapping.task_id

    if phospho_mapping.session_id is not None:
        columns_mapping["session_id"] = phospho_mapping.session_id

    tasks_df.rename(columns=columns_mapping, inplace=True)

    return tasks_df
