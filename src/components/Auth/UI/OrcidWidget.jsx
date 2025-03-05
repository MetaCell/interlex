import { useEffect, useRef } from "react"

const OrcidWidget = ({ clientId, redirectUri }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const script = document.createElement("script")
    script.id = "orcid-widget-script"
    script.src = "/orcid-widget.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div
      id="orcidWidget"
      data-clientid={clientId}
      data-redirecturi={redirectUri}
      data-env="sandbox"
      data-size="lg"
    />
  )
}

export default OrcidWidget;
